"use strict";

angular.module('angularMaterialTimeroller', [])
.directive("timeroller", ["$$rAF", function ($$rAF) {
    return {
        restrict: "EA",
        require: 'ngModel',
        scope: {
            datetime: '=ngModel'
        },
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
            
            if(!scope.datetime) throw new Error("datetime is not defined.");

            var offset = (scope.datetime.getMinutes() % 15);
            scope.datetime.setMinutes(scope.datetime.getMinutes() + offset);
            
            var _selection = d3.select(element[0]);

            var _arc = d3.svg.arc().startAngle(0 * (Math.PI / 180)).endAngle(360 * (Math.PI / 180));

            var _w = 220;
            var _h = 220;
            var _diameter = _w;
            var _margin = { top:16, right:16, bottom:16, left:16 };
            var _fontSize = 10;
            var _inputPadding = 14;

            var _width;
            var _height;
            var _x0;
            var _y0;

            var _minValue = 1;
            var _maxValue = 720;
            var _value = 1;
            
            var _buttonSize = 36;
            var _isAm = false;

            _selection.each(function(data) {
                measure();

                var svg = d3.select(this).selectAll("svg").data([data]);

                var enter = svg.enter().append("svg")
                    .attr("class", "x1-timepicker-svg").append("g");
                    //.attr("transform", "translate(14, 14)");

                svg.attr("width", _w).attr("height", _h);
                
                var background = enter.append("g")
                    .attr("class", "x1-timepicker-component unselectable");
                    
                var plus = background.append("text")
                    .attr("class", "unselectable")
                    .attr("x", _diameter - _buttonSize)
                    .attr("y", _buttonSize)
                    .text("+")
                    .style("font-size", _buttonSize * 1.5 + "px")
                    .on("click", function () {
                        scope.datetime.setMinutes(scope.datetime.getMinutes() + 15);
                        updateValue(scope.datetime);
                    });
                    
                var moins = background.append("text")
                    .attr("class", "unselectable")
                    .attr("x", _diameter - _buttonSize)
                    .attr("y", _margin.top + _height + _buttonSize * 0.8)
                    .text("-")
                    .style("font-size", _buttonSize * 2 + "px")
                    .on("click", function () {
                        scope.datetime.setMinutes(scope.datetime.getMinutes() - 15);
                        updateValue(scope.datetime);
                    });

                var circle = background.append("circle")
                    .attr("class", "x1-timepicker-inner unselectable")
                    .attr("transform", "translate(" + _x0 + "," + _y0 + ")")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", _width / 2);
                
                var slider = background.append("path")
                    .attr("class", "unselectable")
                    .attr("transform", "translate(" + _x0 + "," + _y0 + ")")
                    .attr("d", _arc)
                    .on("click", function () {
                        calculate(d3.event.offsetX, d3.event.offsetY); 
                    });

                var arcContainer = enter.append("g")
                    .attr("class", "x1-timepicker-arcs")
                    .on("click", function () {
                        calculate(d3.event.offsetX, d3.event.offsetY); 
                    });

                var selectedArc = arcContainer.append("path")
                    .attr("class", "arc")
                    .attr("transform", "translate(" + _x0 + "," + _y0 + ")")
                    .attr("d", _arc)
                    .on("click", function () {
                        calculate(d3.event.offsetX, d3.event.offsetY); 
                    });

                // ---------- labels for the picker ------------------------------------------
                var labels = enter.append("g")
                    .attr("class", "x1-timepicker-labels")

                var labelSendAt = labels.append("text")
                    .attr("class", "title")
                    .attr("x", _x0)
                    .attr("y", _y0 - _height * 0.20)
                    .text("Horaire")
                    .style("font-size", (_fontSize * 0.3) + "px");
         
                var sw = labels.append("switch")
         
                var fo = sw.append("foreignObject")
                        .attr("requiredFeatures", "http://www.w3.org/TR/SVG11/feature#Extensibility")
                        .attr("width", _width)
                        .attr("height", (_fontSize + _inputPadding) + "px")
                        .attr("x", _margin.left)
                        .attr("y", _y0 - _height * 0.15)
                        .attr("class", "fo");
                
                var xdiv = fo.append('xhtml:body')
                        .attr('xmlns','http://www.w3.org/1999/xhtml')
                        
                var inputHours = xdiv.append("input")
                    .attr("type", "number")
                    .on("change", function () {
                        var hours = parseInt(this.value);
                        if (isNaN(hours)) { //reset
                            hours = scope.datetime.getHours();
                            this.value = "" + hours;
                        }
                        else {
                            if (hours < 0 || hours >= 24) {
                                hours = 0;
                                this.value = "" + hours;
                            }
                            scope.datetime.setHours(hours);
                            _isAm = isAM(scope.datetime);
                            updateValue(scope.datetime);
                        }
                    });
                            
                xdiv.append("span")
                    .text("h ");
                            
                var inputMinutes = xdiv.append("input")
                    .attr("type", "number")
                    .on("change", function () {
                        var minutes = parseInt(this.value);
                        if (isNaN(minutes)) { //reset
                            minutes = scope.datetime.getMinutes();
                            this.value = "" + (minutes < 10 ? "0" + minutes : minutes);
                        }
                        else {
                            if (minutes < 0 || minutes >= 60) {
                                minutes = 0;
                            }
                            this.value = "" + (minutes < 10 ? "0" + minutes : minutes);
                            scope.datetime.setMinutes(minutes);
                            updateValue(scope.datetime);
                        }
                    });
                        
                var swText = sw.append("text")
                    .attr("class", "no-fo unselectable")
                    .attr("x", _margin.left)
                    .attr("y", _y0 - _height * 0.15);

                var labelAMPM = labels.append("text")
                    .attr("class", "ampm")
                    .attr("cursor", "pointer")
                    .attr("x", _x0)
                    .attr("y", _y0 + _height * 0.20)
                    .attr("width", _width)
                    .style("font-size", (_fontSize * 0.5) + "px")
                    .on("click", function () {
                        var offset = _isAm ? -12 : 12; 
                        scope.datetime.setHours(scope.datetime.getHours() + offset);
                        _isAm = isAM(scope.datetime);
                        scope.$apply(function(){
                            setCurrent(selectedArc, handler, inputHours, inputMinutes, swText, labelAMPM);
                        });
                    });

                // ---------- slider handler ------------------------------------------
                var calculate = function(eventX, eventY) {

                    // --------------------------
                    var _C = Math.PI * _width;

                    var ox = 0;
                    var oy = 0;

                    var ax = 0;
                    var ay = _height / 2;

                    var bx = eventX - _width / 2;
                    var by = _height / 2 - eventY;

                    var k = (by - oy)/(bx - ox);

                    var angel = Math.abs(Math.atan(k) / (Math.PI / 180));
                    var targetAngel = 0;

                    if (bx > 0 && by >= 0) {
                        targetAngel = 90 - angel;
                    } else if (bx >= 0 && by < 0) {
                        targetAngel = 90 + angel;
                    } else if (bx < 0 && by <= 0) {
                        targetAngel = 270 - angel;
                    } else if (bx <= 0 && by > 0) {
                        targetAngel = 270 + angel;
                    }
                    
                    var value = _maxValue * (targetAngel / 360);
 
                    //set way
                    var shift = value - _value;
                    var way = 0;
                    var change = false;
                    
                    if (shift > 0) {
                        if (_value < 180 && value > 540) {
                            way = -1;
                            change = true;
                        }
                        else way = 1;
                    }
                    else if (shift < 0) {
                        if (_value > 540 && value < 180) { 
                            way = 1;
                            change = true;
                        }
                        else way = -1;
                    }
                                  
                    _value = value;

                    // update scope.datetime
                    var hours12 = Math.floor(_value / 60);
                    var minutes = _value % 60;

                    var copy = new Date(scope.datetime.getFullYear(), scope.datetime.getMonth(), scope.datetime.getDate(), scope.datetime.getHours(), scope.datetime.getMinutes());

                    if (_isAm) {
                        if (change) {
                            copy.setHours(hours12);
                        }
                        else {
                            copy.setHours(hours12 + 12);
                        }
                    }
                    else {
                        if (change) {
                            copy.setHours(hours12 + 12);
                        }
                        else {
                            copy.setHours(hours12);
                        }
                    }
                    
                    var offset = (minutes % 15) - 15;                    
                    copy.setMinutes(minutes - offset);
                    
                    scope.datetime.setHours(copy.getHours());
                    scope.datetime.setMinutes(copy.getMinutes());
                                        
                    _isAm = isAM(scope.datetime);
                    
                    scope.$apply(function(){
                        setCurrent(selectedArc, handler, inputHours, inputMinutes, swText, labelAMPM);
                    });
                };
                
                var drag = d3.behavior.drag().on("drag", function() { 
                    calculate(d3.event.x, d3.event.y); 
                });
                
                var debouncedDrag = $$rAF.throttle(drag);

                var handler = enter.append("g").append("circle")
                    .attr("class", "x1-timepicker-handler")
                    .attr("cursor", "pointer")
                    .attr("transform", "translate(" + _x0 + "," + _y0 + ")")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", 14)
                    .call(debouncedDrag);

                // ---------- set the init value from ng-model ----------------------------------------------
                var updateValue = function(datetime) {
                    var hours = datetime.getHours()
                    var hours12 = hours >= 12 ? hours - 12 : hours;
                    var minutes = datetime.getMinutes();
                    _value = (hours12 * 60 + minutes);
                    
                    setCurrent(selectedArc, handler, inputHours, inputMinutes, swText, labelAMPM);
                };

                updateValue(scope.datetime);

                _isAm = isAM(scope.datetime);

                scope.$watch("datetime", function(newVal, oldVal) {
                    if (!newVal) throw new Error("newVal is not defined.");
                    updateValue(newVal);
                });
            });

            function isAM (date) {
                return date.getHours() >= 12;
            };

            function measure () {
                _height = _diameter - _margin.top - _margin.bottom;
                _width = _diameter - _margin.right - _margin.left;
                
                _y0 = _margin.top + _height / 2;
                _x0 = _margin.left + _width / 2;
                
                _fontSize = _width * .2;
                _arc.outerRadius(_width / 2);
                _arc.innerRadius(_width / 2 * .85);
            };

            function displayCursor (selectedArc, handler) {
                var ratio = Math.min((_value - _minValue) / (_maxValue - _minValue), 1);
                var endAng = Math.min(360 * ratio, 360) * Math.PI / 180;
                _arc.endAngle(endAng);
                selectedArc.attr("d", _arc);

                var oAngel = 360 * _value / _maxValue;
                var r = _width / 2 - 5;
                var x = r * Math.cos((oAngel - 90) * Math.PI / 180);
                var y = r * Math.sin((oAngel - 90) * Math.PI / 180);
                handler.attr('cx', x).attr('cy', y);
            };
            
            function displayScope(inputHours, inputMinutes, swText, labelAMPM) {
                var hours = scope.datetime.getHours();
                var minutes = scope.datetime.getMinutes();
                
                var strMinutes = "" + (minutes < 10 ? "0" + minutes : minutes);
                inputHours.property("value", hours);
                inputMinutes.property("value", strMinutes);
                swText.text(hours + "h "+ strMinutes);
                
                var period = hours < 12 ? "matin" : "après-midi";
                labelAMPM.text(period);
            };
            
            function setCurrent (selectedArc, handler, inputHours, inputMinutes, swText, labelAMPM) {
                displayCursor(selectedArc, handler);
                displayScope(inputHours, inputMinutes, swText, labelAMPM);
            };
        }
    };
}]);