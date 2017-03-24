import { Component } from 'preact'
import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import TimeAgo from 'react-timeago'

import { setSync, clearSync } from 'shared/modules/sync/syncDuck'
import { authenticate, initialize, status, getResourceFor, signOut } from 'services/browserSyncService'
import { setContent as setEditorContent } from 'shared/modules/editor/editorDuck'

import {Drawer, DrawerBody, DrawerHeader, DrawerSection, DrawerSubHeader, DrawerSectionBody, DrawerToppedHeader} from 'browser-components/drawer'
import { FormButton } from 'browser-components/buttons'
import { BinIcon } from 'browser-components/icons/Icons'
import {ConsentCheckBox, AlertBox, ClearLocalConfirmationBox, SyncLink, SmallHeaderText} from './styled'
import BrowserSyncAuthWindow from './BrowserSyncAuthWindow'

export class BrowserSync extends Component {
  constructor (props) {
    super(props)

    this.state = {
      authData: props.authData,
      error: null,
      serviceAuthenticated: props.authData !== null,
      status: props.authData ? 'UP' : 'DOWN',
      userConsented: false,
      showConsentAlert: false,
      clearLocalRequested: false
    }
  }

  authCallBack (data, error) {
    if (error) {
      this.setState({serviceAuthenticated: false, error: error})
    } else {
      this.setState({authData: data})
      authenticate(this.state.authData.data_token).then((a) => {
        this.setState({serviceAuthenticated: true, error: null})
        this.bindToResource()
      })
      .catch((e) => {
        this.setState({serviceAuthenticated: false, error: e})
      })
    }
  }

  componentWillMount () {
    initialize()
    this.serviceIsUp()
  }

  logIn () {
    if (this.state.userConsented === true) {
      BrowserSyncAuthWindow('https://localhost:9001', this.authCallBack.bind(this))
    } else {
      this.setState({showConsentAlert: true})
    }
  }

  serviceIsUp () {
    status().on('value', (v) => {
      if (v.val()) {
        this.setState({
          status: 'UP'
        })
      } else {
        this.setState({
          status: 'DOWN'
        })
      }
    })
  }

  bindToResource () {
    this.syncRef = getResourceFor(this.state.authData.profile.user_id)
    this.syncRef.on('value', (v) => {
      this.props.onSync({key: this.state.authData.profile.user_id, syncObj: v.val(), lastSyncedAt: new Date(), authData: this.state.authData})
    })
  }

  clearLocalStorage () {
    if (this.state.clearLocalRequested) {
      this.setState({clearLocalRequested: false, authData: null, serviceAuthenticated: false})
      this.props.onSignOut()
    } else {
      this.setState({clearLocalRequested: true})
    }
  }

  render () {
    if (this.state.status === 'DOWN') {
      return <Drawer id='sync-drawer'><DrawerHeader>Sync service is down</DrawerHeader></Drawer>
    }

    let offlineContent = null
    let consentAlertContent = null
    let onlineContent = null
    let clearLocalDataContent = null
    let headerContent = null

    if (this.state.serviceAuthenticated) {
      headerContent =
        <DrawerToppedHeader>
          {this.state.authData.profile.name}<br />
          <SmallHeaderText>Connected</SmallHeaderText><br />
          <SmallHeaderText>
            Synced <TimeAgo date={new Date(this.props.lastSyncedAt)} minPeriod='5' />
          </SmallHeaderText>
        </DrawerToppedHeader>
    } else {
      headerContent = <DrawerHeader>Neo4j Browser Sync</DrawerHeader>
    }

    if (this.state.clearLocalRequested === true) {
      clearLocalDataContent = <ClearLocalConfirmationBox onClick={() => { this.setState({clearLocalRequested: false}) }} />
    } else {
      clearLocalDataContent = 'This will reset your local storage, clearing favorite scripts, grass, command history and settings.'
    }

    if (this.state.showConsentAlert) {
      consentAlertContent = <AlertBox onClick={() => { this.setState({showConsentAlert: false}) }} />
    }

    if (this.state.serviceAuthenticated === true) {
      onlineContent = (
        <DrawerBody>
          <DrawerSection>
            <DrawerSubHeader>Manage local data</DrawerSubHeader>
            <DrawerSectionBody>
              <DrawerSection>{clearLocalDataContent}</DrawerSection>
              <FormButton label={this.state.clearLocalRequested ? 'Sign out + clear' : 'Sign out'} onClick={() => this.clearLocalStorage()}
                icon={<BinIcon suppressIconStyles='true' />} buttonType='secondary' />
            </DrawerSectionBody>
          </DrawerSection>
        </DrawerBody>
      )
    } else {
      offlineContent = (
        <DrawerBody>
          <DrawerSection>
            <DrawerSubHeader>Manage local data</DrawerSubHeader>
            <DrawerSectionBody>
              <DrawerSection>{clearLocalDataContent}</DrawerSection>
              <FormButton label='Clear local data' onClick={() => this.clearLocalStorage()}
                icon={<BinIcon suppressIconStyles='true' />} buttonType='secondary' />
            </DrawerSectionBody>
          </DrawerSection>
          <DrawerSection>
            <DrawerSubHeader>Sign In or Register</DrawerSubHeader>
            <DrawerSectionBody>
              <DrawerSection>
                Neo4j Browser Sync is a companion cloud service for Neo4j Browser. Connect through a simple social
                sign-in
                to get started.
              </DrawerSection>
              <DrawerSection>
                <SyncLink onClick={() => this.props.onSyncHelpClick()}>About Neo4j Browser Sync</SyncLink>
              </DrawerSection>
              <DrawerSection>
                <FormButton label='Sign In / Register' onClick={this.logIn.bind(this)}
                  icon={<BinIcon suppressIconStyles='true' id='browserSyncLogin' />} buttonType='secondary' />
              </DrawerSection>
              <DrawerSection>
                <ConsentCheckBox checked={this.state.userConsented} onChange={(e) => this.setState({
                  userConsented: e.target.checked,
                  showConsentAlert: this.state.showConsentAlert && !e.target.checked
                })} />
                {consentAlertContent}
              </DrawerSection>
            </DrawerSectionBody>
          </DrawerSection>
        </DrawerBody>
      )
    }

    return (
      <Drawer id='sync-drawer'>
        {headerContent}
        {offlineContent}
        {onlineContent}
      </Drawer>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    lastSyncedAt: state.sync ? state.sync.lastSyncedAt : null,
    authData: state.sync ? state.sync.authData : null
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSync: (syncObject) => {
      const action = setSync(syncObject)
      ownProps.bus.send(action.type, action)
    },
    onSyncHelpClick: (play) => {
      const action = setEditorContent(':play neo4j sync')
      ownProps.bus.send(action.type, action)
    },
    onSignOut: () => {
      signOut()
      const action = clearSync()
      ownProps.bus.send(action.type, action)
    }
  }
}
export default withBus(connect(mapStateToProps, mapDispatchToProps)(BrowserSync))
