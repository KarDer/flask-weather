var Box = React.createClass({
    render: function() {
        return (
            <div className='weatherBox'>
                <div className='city'>
                    <h2>{this.props.city}</h2>
                </div>
                <div className='weather_type'>
                    {this.props.weather_type}
                </div>
                <div className='temperature'>
                    +<strong>{this.props.temperature} &deg;С</strong>
                </div>
                <div className='wind_speed'>
                    Ветер: <strong>{this.props.wind_speed}</strong> м/с
                </div>
                <div className='humidity'>
                    Влажность: <strong>{this.props.humidity}</strong>%
                </div>
                <div className='pressure'>
                    Давление: <strong>{this.props.pressure}</strong> мм рт. ст.
                </div>
            </div>
        )

    }
});

var BoxContainer = React.createClass({
    render: function() {
        var boxes = [this.props.boxes].map(function (i) {
            return (
                <Box city={i.city} temperature={i.temperature} weather_type={i.weather_type} wind_speed={i.wind_speed} humidity={i.humidity} pressure={i.pressure}/>
            );
        });
        return (
            <div className='box-container'>
                {boxes}
            </div>
        );
    }
});

var Weather = React.createClass({
    handleKeyDown: function(event) {
        if(event.keyCode === 13) {
            $.get(this.props.source, {city: event.target.value, city_list: getCookie("city_list")}, function(result) {
                var city_list = [];
                for(var k=0; k < Object.keys(result).length; k++) {
                    $.each(result[k], function (index, value) {
                        if (index == 'city') {
                            city_list.push(value)
                        }
                    });
                }
                if(setBox(result) == true) {
                    setCookie("city_list", city_list);
                    $('input').val('');
                }
            });
        }
    },
    render: function() {
        return (
            <div>
                <input name="city" type="text" placeholder="Enter city" onKeyDown={this.handleKeyDown} />
            </div>
        )
    }
});
React.render(<Weather source="/filter" />, document.getElementById('formInput'));

function setBox(arr){
    if($.isEmptyObject(arr)){
        $('input').css('border-color', '#D8A3A3');
        return false
    }
    $('input').css('border-color', '#a3d8d6');
    for (var k = 0; k < Object.keys(arr).length; k++) {
        $('#content').append('<div id="box' + k + '"></div>');
        React.render(<BoxContainer boxes={arr[k]} />, document.getElementById('box' + k));
    }
    return true
}

$.get("/filter", {city: '', city_list: getCookie("city_list")}, function(result) {
    setBox(result);
});