import React,{useState,useEffect} from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import "rc-tooltip/assets/bootstrap.css";
// 
const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

const ScheduleSlider=(props)=>{
    const [startTime,setStartTime]=useState(0);
    const [endTime,setEndTime]=useState(0);
    const [dynamicKey,setDynamicKey]=useState(Date.now());
    const markStyle = {
        fontSize: "1.25em",
        marginTop: "0.25em"
    };
    useEffect(()=>{
        makeRangeTimeValues();
    },[props.StartTime,props.EndTime]);
    const makeRangeTimeValues=()=>{
        let sTime=props.StartTime;
        let eTime=props.EndTime;
        sTime=sTime.split(':');
        eTime=eTime.split(':');
        let sTimeHr=parseInt(sTime[0]);
        let sTimeMin=parseInt(sTime[1]);
        if(sTimeMin===30){
            sTimeMin=0.5;
        }else{
            sTimeMin=0
        }
        sTime=sTimeHr+sTimeMin;
        let eTimeHr=parseInt(eTime[0]);
        let eTimeMin=parseInt(eTime[1]);
        if(eTimeMin===30){
            eTimeMin=0.5;
        }else{
            eTimeMin=0
        }
        eTime=eTimeHr+eTimeMin;
        // Setting State Now
        setStartTime(sTime);
        setEndTime(eTime);
        setDynamicKey(Date.now());
    }
    const timeCal = (numericValue) => {
        let hr = numericValue;
        let min = "00";
        if (numericValue % 1 === 0.5) {
          min = "30";
          hr = numericValue - 0.5;
        }
        let timeVal = `${hr}:${min}`;
        return timeVal;
    };
    const onChange=sliderVal=>{
        setStartTime(sliderVal[0]);
        setEndTime(sliderVal[1]);
        props.CallbackForTimeSlot(sliderVal[0],sliderVal[1],props.DayIndex,props.Day);
    }
    return (
        <Range
            key={dynamicKey}
            tipFormatter={(value) => timeCal(value)}
            onChange={onChange}
            className="test"
            value={[startTime,endTime]}
            allowCross={false}
            min={0}
            max={24}
            step={0.5}
            dotStyle={{
                width: "1px",
                height: "1px",
                backgroundColor:'lightgrey',
                borderColor:'lightgrey'
            }}
            activeDotStyle={{
                width:"1px",
                height:"1px",
                backgroundColor:'#895070',
                borderColor:'#895070'
            }}
            trackStyle={[
            {
                backgroundColor: "#895070",
                height: "1em"
            }
            ]}
            railStyle={{
                backgroundColor: "lightgrey",
                height: "1em"
            }}
            handleStyle={[
            {
                backgroundColor: "#b56994",
                borderColor: "#b56994",
                height: "1.5em",
                width: "1.5em",
                boxShadow:"none",
            },
            {
                backgroundColor: "#b56994",
                borderColor: "#b56994",
                height: "1.5em",
                width: "1.5em",
                boxShadow:'none'
            }
            ]}
            marks={{
                3: {
                    style: markStyle,
                    label: <strong>3:00</strong>
                },
                6: {
                    style: markStyle,
                    label: <strong>6:00</strong>
                },
                9: {
                    style: markStyle,
                    label: <strong>9:00</strong>
                },
                12: {
                    style: markStyle,
                    label: <strong>12:00</strong>
                },
                15: {
                    style: markStyle,
                    label: <strong>15:00</strong>
                },
                18: {
                    style: markStyle,
                    label: <strong>18:00</strong>
                },
                21: {
                    style: markStyle,
                    label: <strong>21:00</strong>
                },
            }}
        />
    );
}

export default ScheduleSlider;