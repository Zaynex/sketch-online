let Preview = (layers) => {
  let fragment = document.createDocumentFragment()
  layers.forEach(layer => {
    for (let k in Object.values(layer)[0][0]) {
      let tempNode = document.createElement('div')
      // tempNode.style[k] = k
      tempNode.innerHTML = k
      fragment.appendChild(tempNode)
    }
  })
  document.body.appendChild(fragment)
}