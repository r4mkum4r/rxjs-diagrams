import React, { PureComponent, PropTypes } from 'react'
import { transformEmissions } from '../../models/emissions/index'
import DraggableView from '../draggable/index'
import TransitionView from '../transition/index'
import TransformNote from './transformNote'

import {
  leftGradientColor,
  rightGradientColor
} from '../observable/constants'

const PADDING_FACTOR = 0.2

class OperatorDiagram extends PureComponent {
  static propTypes = {
    label: PropTypes.string,
    transform: PropTypes.func.isRequired,
    emissions: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
      PropTypes.arrayOf(PropTypes.object)
    ]).isRequired
  }

  static defaultProps = {
    width: 500,
    height: 50
  }

  state = {
    completion: this.props.completion
  }

  processInput = (input, completion) => {
    const { transform } = this.props

    const output$ = transformEmissions(transform, completion, ...input)

    output$.subscribe(output => {
      this.setState({ input, output, completion })
    })
  }

  initInput = (emissions, completion) => {
    const hasMultipleInputs = emissions.some(Array.isArray)

    const input = hasMultipleInputs ?
        emissions :
        [ emissions ]

    this.processInput(input, completion)
  }

  updateEmissions = (i, emissions) => {
    const input = this.state.input.slice()
    input[i] = emissions

    this.processInput(input)
  }

  updateCompletion = completion => {
    this.processInput(this.state.input, completion)
  }

  componentWillMount() {
    this.initInput(this.props.emissions, this.props.completion)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.emissions !== nextProps.emissions ||
      this.props.completion !== nextProps.completion
    ) {
      this.initInput(nextProps.emissions, nextProps.completion)
    }
  }

  render() {
    const {
      end,
      width,
      height,
      transform,
      label
    } = this.props

    const {
      output,
      input,
      completion
    } = this.state

    if (!output) {
      return null
    }

    const totalHeight = height * (2 + input.length) + 2 * (PADDING_FACTOR * height)

    return (
      <svg
        viewBox={`0 0 ${width} ${totalHeight}`}
        width={width}
        height={totalHeight}
      >
        <defs>
          <linearGradient id="stroke">
            <stop offset="0%" stopColor={leftGradientColor}/>
            <stop offset="100%" stopColor={rightGradientColor}/>
          </linearGradient>
        </defs>

        {
          input.map((emissions, i) => (
            <DraggableView
              {...this.props}
              key={i}
              emissions={emissions}
              completion={completion}
              onChangeEmissions={input => this.updateEmissions(i, input)}
              onChangeCompletion={this.updateCompletion}
              y={i * height}
            />
          ))
        }

        <TransformNote
          width={width - 2 * PADDING_FACTOR * width}
          height={height}
          x={PADDING_FACTOR * width}
          y={height * input.length + PADDING_FACTOR * height}
        >
          {label || transfom.toString()}
        </TransformNote>

        <TransitionView
          {...this.props}
          y={height * (input.length + 1) + 2 * PADDING_FACTOR * height}
          emissions={output.emissions}
          completion={output.completion}
        />
      </svg>
    )
  }
}

export default OperatorDiagram