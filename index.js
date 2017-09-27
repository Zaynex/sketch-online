import JSZip from 'jszip'
import { getId, log } from './help'
import './index.css'

const PREVIEW_MAX_SIZE = 2048.0
const PREVIEW_ARTBOARD_PADDING = 60.0
const fileUpload = getId('file')
const bg = getId('bg')
const sketchObject = window
let i = 1

fileUpload.addEventListener('change', loadSketch, false)

function loadSketch (e) {
  let files = e.target.files || e.dataTransfer.files
  if (!files.length) return
  handleSketch(files[0])
}

function handleSketch (file) {
  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  reader.onload = (e) => {
    JSZip.loadAsync(e.target.result).then((zip) => {
      log(zip)
      zip.forEach(function (relativePath, zipEntry) {
        if (relativePath === 'previews/preview.png') {
          zipEntry.async('base64').then(function success (content) {
            bg.style.backgroundImage = 'data:image/png;base64,' + content
            const image = new Image()
            image.onload = function () {
              sketchObject.imageWidth = image.width
              sketchObject.imageHeight = image.height
              bg.style.width = `${image.width}px`
              bg.style.height = `${image.height}px`
              if (sketchObject.imageWidth && sketchObject.artboards && sketchObject.imageWidth >= PREVIEW_MAX_SIZE) {
                sketchObject.artboardWidth = (PREVIEW_MAX_SIZE - (PREVIEW_ARTBOARD_PADDING * (sketchObject.artboards.length - 1))) / sketchObject.artboards.length
              }
            }
            image.src = sketchObject.imageData
          }, function error (e) {
            console.log(e)
            sketchObject.error = 'Could not load Sketch preview'
          })
        }
        else if (relativePath.startsWith('pages/')) {
          zipEntry.async('string').then(function success (content) {
            const page = JSON.parse(content)
            if (i == 1) {
              // 按照sketch文件解析的顺序来,第一层为 pages，第二层为 symbols，不支持多层
              sketchObject.symbols = page.layers
            } else {
              if (page[0]['_class'].includes('symbolMaster')) {
                sketchObject.pages = page.layers
              } else {
                throw new Error('解析失败，请您按照正确 sketch 文件摆放规则')
              }
            }

            if (sketchObject.imageWidth && sketchObject.artboards && sketchObject.imageWidth >= PREVIEW_MAX_SIZE) {
              sketchObject.artboardWidth = (PREVIEW_MAX_SIZE - (PREVIEW_ARTBOARD_PADDING * (sketchObject.artboards.length - 1))) / sketchObject.artboards.length
            }
            i++
          },
            function error (e) {
              console.log(e)
              sketchObject.error = 'Could not load page'
            })
        }
      })
    },
      function (e) {
        console.log(e)
        sketchObject.error = 'Only .sketch files that were saved using the new Sketch 43 are supported.'
      })
  }
}