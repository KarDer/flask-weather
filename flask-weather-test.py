#-*- coding: utf-8 -*-
from flask import Flask, request, render_template, jsonify

import urllib
import xml.etree.ElementTree as ET

app = Flask(__name__)

def found_city(city_list):
    """
    Looking for all the cities and return parameters for each of them
    :param city_list: List the names of cities
    :return: dictionary parameters of each city
    """
    found_id_list = []
    result_dict = {}

    if not city_list:
        return {}

    tree = ET.parse(urllib.urlopen("https://pogoda.yandex.ru/static/cities.xml"))
    root = tree.getroot()
    for city in city_list:
        if not city:
            continue

        if type(city) != unicode:
            city = unicode(city, encoding='utf-8')

        found = [element for element in root.getiterator() if element.text == city]
        if not found:
            return {}
        found_id_list.append(found[0].attrib['id'])

    for found_id in range(len(found_id_list)):
        dict = {}
        tree = ET.parse(urllib.urlopen("https://export.yandex.ru/weather-ng/forecasts/"+found_id_list[found_id]+".xml"))
        root = tree.getroot()
        ns = {'main': 'http://weather.yandex.ru/forecast'}
        fact = root.find('main:fact', ns)
        dict.update({i: fact.find('main:' + i, ns).text for i in ('temperature', 'weather_type', 'wind_speed', 'humidity', 'pressure')})
        dict.update({"city": root.attrib['city']})
        result_dict.update({found_id: dict})

    return result_dict

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/filter', methods=['GET'])
def filter():
    """
    Looks GET parameters and searches for all cities
    :return: json - data for each city
    """
    city = ''
    city_list = []

    if request.args.get("city"):
        city = request.args.get("city")
    if request.args.get("city_list"):
        [city_list.append(i) for i in request.args.get("city_list").split(',')]

    city_list.append(city)
    dict_city = found_city(city_list)

    return jsonify(dict_city)

if __name__ == '__main__':
    app.run()
