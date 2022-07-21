/* @SandboxCustomCode */

import constants from '../constants'

class Sandbox {
  constructor() {
    return this
  }

  async handleBrowserCredentialing() {
    let auth0key, usecase, res

    try {
      const hash = window.location.hash || window.location.search
      if (!hash || hash === '') {
        console.warn('no hash avaiable to perform credentialising')
        return
      }

      const pwfetch: any = new URLSearchParams(window.location.search)

      const [, hashKey, token] = pwfetch.get('token').split(':')
      res = await this.getCredentials(hashKey, token)
      if (!res || !res.sandboxHashkey || !res.password) {
        return
      }
      auth0key = res['auth0_key']

      usecase = res['usecase']
      document.cookie = 'intcmusr=' + auth0key + '; path=/'
      document.cookie = 'intcmsbox=' + usecase + '; path=/'
    } catch (e) {
      console.warn(e)
      return
    }

    return {
      auth0key,
      usecase,
      data: res
    }
  }

  getCredentials(hashKey: string, token: string) {
    return fetch(
      `${constants.API_BASE_URL}/SandboxAuthdGetInstanceByHashKey?sandboxHashKey=${hashKey}`,
      {
        headers: {
          Authorization: token,
          Accept: 'application/json'
        }
      }
    )
      .then(res => res.json())
      .then(res => {
        return res
      })
      .catch(e => {
        console.log(e)
      })
  }
}

export default Sandbox
