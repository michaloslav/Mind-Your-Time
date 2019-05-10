import React from 'react';
import ConfettiWrapper from './ConfettiWrapper'
import ProductivityLineChart from './ProductivityLineChart'
import "./css/Congrats.css"

const Congrats = props => {
  // sort productivityPercentages by their dates
  let prodPercArr = []
  Object.entries(props.productivityPercentages).forEach(val => prodPercArr.push({date: val[0], perc: val[1]}))
  prodPercArr.sort((a, b) => a.date > b.date ? 1 : -1)

  // the current one
  let productivityPercentage = prodPercArr[prodPercArr.length - 1].perc

  // should we show the LineChart displaying productivity percentages or not?
  // is there currently enough data for it to make sense?
  let showLineChart = (
    prodPercArr.length > 3 &&
    productivityPercentage >= 0 &&
    productivityPercentage <= 100
  )

  let showConfetti = props.dateString === prodPercArr[prodPercArr.length - 1].date

  return (
    <div className="Congrats">
      <span className="congratsSpan">
        CONGRATULATIONS!
      </span>
      <br/>
      You got {props.totalTimeWorkedString} worth of work done
      <br/>
      {
        productivityPercentage >= 0 && productivityPercentage <= 100 &&(
          <span>
            You were productive {productivityPercentage}% of the time
          </span>
        )
      }
      {showLineChart && <ProductivityLineChart prodPercArr={prodPercArr} /> }
      {showConfetti && <ConfettiWrapper /> }
    </div>
  )
}

export default Congrats
