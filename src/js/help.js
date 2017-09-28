const getId = document.getElementById.bind(document)
const log = console.log.bind(console)

const mapIterator = (pages) => {
  return pages.map((page) => {
    const classType = page['_class']
    const name = page.name
    return { [name]: iterator(page, getAttributes) }
  })
}

const iterator = (page, callback) => {
  let resultArr = []
  if (!page) return
  const { layers } = page
  let stack
  if (!layers) {
    return resultArr.push(callback(page))
  }
  // the default data was reverse, create new Array and make it positive
  stack = [...layers].reverse()
  let dealData
  /**
   * Iterator all the layers, add the child layers in the last array.
   * To make sure Array.pop deal with the first child layers
  */
  while (dealData = stack.pop()) {
    const { layers } = dealData
    callback && resultArr.push(callback(dealData))
    if (layers && layers.length) {
      stack = [
        ...stack,
        ...([...layers].reverse())
      ]
    }
  }
  // filter true value
  resultArr = ([...resultArr].filter(v => v))
  return resultArr
}

const getAttributes = (page) => {
  const { frame, name, resizingConstraint, backgroundColor, style, symbolID } = page
  const cslassType = page['_class']
  let basicResult = Object.create(null)
  if (symbolID) {
    Object.assign(basicResult, { symbolID })
  }
  if (style) {
    const { borders, fills, shadows } = style
    if (borders) {
      const borderMap = borders.map(({ color, thickness, fillType }) => {
        return {
          color: getRgbaColor(color),
          width: thickness
        }
      })
      Object.assign(basicResult, { borderMap })
    }

    if (shadows) {
      const shadowMap = shadows.map(({ blurRadius, color, offsetX, offsetY, spread, contextSettings: { opacity } }) => {
        return {
          blurRadius,
          color: getRgbaColor(color),
          x: offsetX,
          y: offsetY,
          spread,
          opacity
        }
      })
      Object.assign(basicResult, { shadowMap })
    }

    if (fills) {
      const fillColors = fills.map(({ color }) => {
        return {
          color: getRgbaColor(color)
        }
      })
      Object.assign(basicResult, { fillColors })
    }
  }
  Object.assign(basicResult, {
    ...getFrame(frame),
    resizingConstraint,
    name
  })

  return basicResult

}

const getFrame = ({ width, height, x, y }) => ({
  width, height, x, y
})

const getRgbaColor = (backgroundColor) => {
  const { red, green, blue, alpha } = backgroundColor
  const makeNormal = (r) => Math.round(r * 255)
  return `rgba(${makeNormal(red)}, ${makeNormal(green)}, ${makeNormal(blue)}, ${alpha})`
}
export {
  getId,
  log,
  mapIterator
}