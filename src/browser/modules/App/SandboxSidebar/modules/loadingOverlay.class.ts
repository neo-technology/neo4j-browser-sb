{
  /* @SandboxCustomCode */
}

import constants from '../constants'

export class Overlay {
  constructor() {
    return this
  }

  static addOverlay() {
    const container = document.createElement('div')
    container.setAttribute('id', 'sandbox-browser-loader')
    container.setAttribute('style', constants.styles.container)

    const loadingContainer = document.createElement('div')
    loadingContainer.setAttribute('style', constants.styles.loadingContainer)

    const bar = document.createElement('div')
    bar.setAttribute('id', 'bar')
    bar.setAttribute('style', constants.styles.bar)

    const label = document.createElement('div')
    label.setAttribute('style', constants.styles.label)
    label.innerHTML = 'Firing up Neo4j Browser'

    loadingContainer.appendChild(bar)
    loadingContainer.appendChild(label)
    container.appendChild(loadingContainer)
    document.body.appendChild(container)
  }

  static autoProgess() {
    const barElement = document.getElementById('bar')
    if (!barElement) return
    let currentLoaderPercent = 5
    const incrementLoader = () => {
      currentLoaderPercent = currentLoaderPercent + 4
      if (currentLoaderPercent > 90) return
      barElement.style.width = `${currentLoaderPercent}%`
      setTimeout(incrementLoader, 1000)
    }
    incrementLoader()
  }

  static hideOverlay() {
    const container = document.getElementById('sandbox-browser-loader')
    if (!container) return
    container.style.transition = 'visibility 0s .5s, opacity .5s linear'
    container.style.opacity = '0'
    container.style.visibility = 'hidden'
  }
}
