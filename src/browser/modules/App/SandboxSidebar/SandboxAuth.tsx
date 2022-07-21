/* @SandboxCustomCode */

import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { GlobalState } from 'shared/globalState'
import {
  CONNECT,
  setActiveConnection
} from 'shared/modules/connections/connectionsDuck'
import { isServerConfigDone } from 'shared/modules/dbMeta/dbMetaDuck'
import { FrameStack, getFrames } from 'shared/modules/frames/framesDuck'
import { SidebarState } from 'shared/modules/sidebar/sidebarDuck'

import constants from './constants'
import { Overlay } from './modules/loadingOverlay.class'
import Sandbox from './modules/sandbox'

declare global {
  interface Window {
    _neo4jSandbox: {
      data: null | {
        usecase: string
        password: string
        ip: string
        sandboxHashkey: string
        auth0_key: string
      }
    }
  }
}

interface IProps {
  children: React.ReactNode
  setActiveConnection: Function
  bus: any
  isServerConfigDone: boolean
  sidebar: SidebarState
  frames: FrameStack[]
}

const SandboxAuth = (props: any) => {
  const [isCredentialingDone, setIsCredentialingDone] = useState(false)
  const [isCredentialingError, setIsCredentialingError] = useState(false)

  const { sidebar, frames } = props

  useEffect(() => {
    const handleTask = async () => {
      // Credentialing
      const sandbox = new Sandbox()
      console.log('doing sandbox auth')
      const sandboxData = await sandbox.handleBrowserCredentialing()

      if (!sandboxData || !sandboxData.data || !sandboxData.data.password) {
        window._neo4jSandbox = {
          data: null
        }
        console.warn('credentialing not complete')
        setIsCredentialingDone(true)
        setIsCredentialingError(true)
        return
      }

      const connectionDetails = {
        id: 'Sandbox',
        host: `bolt+s://${sandboxData?.data['sandboxHashkey']}.${constants.SANDBOX_DOMAIN}:${sandboxData?.data['boltPort']}`,
        username: 'neo4j',
        password: sandboxData?.data.password,
        authenticationMethod: 'NATIVE'
      }

      props.bus.self(CONNECT, connectionDetails, () => {
        props.setActiveConnection(connectionDetails.id)
      })

      // Tracking
      window._neo4jSandbox = {
        data: sandboxData?.data
      }

      setIsCredentialingDone(true)
    }
    handleTask()
  }, [])

  useEffect(() => {
    Overlay.addOverlay()
    Overlay.autoProgess()
  }, [])

  useEffect(() => {
    // If there was an error in credntialing, then immediately hide the overlay
    if (isCredentialingError) {
      Overlay.hideOverlay()
      return
    }

    const isGuideFrame = frames.some((frame: FrameStack) => {
      const firstStackFram = frame.stack[0]
      return firstStackFram.type === 'play-remote'
    })
    const isSidebarGuide = sidebar.drawer === 'guides'
    if (isCredentialingDone && (isGuideFrame || isSidebarGuide))
      Overlay.hideOverlay()
  }, [isCredentialingDone, isCredentialingError, frames, sidebar])

  return <div>{isCredentialingDone && props.children}</div>
}

const mapStateToProps = (state: GlobalState) => ({
  isServerConfigDone: isServerConfigDone(state),
  sidebar: state.sidebar,
  frames: getFrames(state)
})

const mapDispatchToProps = (dispatch: any) => {
  return {
    setActiveConnection: (id: any) => dispatch(setActiveConnection(id))
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(SandboxAuth)
)
