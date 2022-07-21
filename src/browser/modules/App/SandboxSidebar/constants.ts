{
  /* @SandboxCustomCode */
}

import tokens from '@neo4j-ndl/base/lib/tokens/js/tokens'

const ENV =
  window.location.href.indexOf('.neo4jsandbox.com') > -1 &&
  window.location.href.indexOf('development.neo4jsandbox.com') === -1
    ? 'prod'
    : 'dev'

interface Props {
  ENV: string
  INTERNAL_API_BASE_URL: string
  API_BASE_URL: string
  SANDBOX_DOMAIN: string
  styles: any
}

const constants: Props = {
  ENV,
  INTERNAL_API_BASE_URL: 'https://internal-api.neo4j.com',
  API_BASE_URL:
    ENV !== 'prod'
      ? 'https://1dziw625ea.execute-api.us-east-1.amazonaws.com/development'
      : 'https://efz1cnte2e.execute-api.us-east-1.amazonaws.com/main',
  SANDBOX_DOMAIN:
    ENV !== 'prod' ? 'development.neo4jsandbox.com' : 'neo4jsandbox.com',
  styles: {
    container: `    
        position: absolute;
        width: 100%;
        height: 100vh;
        background: #EEF1F8;
        top: 0;
        left: 0;
        z-index: 99;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: visible;
        opacity: 1;
        transition: opacity 2s linear;
      `,
    loadingContainer: `
        box-shadow: none;
        background: rgba(0,0,0,.1);
        padding: 0;
        border-radius: .28571429rem;
        position: relative;
        width: 600px;
        height: 20px;
        border-radius: 20px;
      `,
    bar: `
        transition-duration: 300ms;
        width: 20%;
        background-color: ${tokens.colors.primary[40]};
        position: relative;
        min-width: 2em;
        height: 20px;
        border-radius: 10px;
      `,
    label: `
        text-align: center;
        margin-top: 18px;
        color: #525865;
        font-family: sans-serif;
      `
  }
}

export default constants
