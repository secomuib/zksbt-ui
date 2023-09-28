'use client';

import { Icon, Menu, Segment } from 'semantic-ui-react';

export default function Header() {
  return (
    <Segment inverted>
      <Menu inverted pointing secondary style={{ marginTop: '10px'}}>
        <Menu.Item><Icon name='protect' size='big'/>ZKPSBT</Menu.Item>
        <Menu.Menu position='right'>
          <Menu.Item href="#requestsbt">Request SBT</Menu.Item>
          <Menu.Item href="#mintsbt">Mint SBT</Menu.Item>
          <Menu.Item href="#requestzkp">Request ZKP</Menu.Item>
          <Menu.Item href="#generatezkp">Generate ZKP</Menu.Item>
          <Menu.Item href="#verifyzkp">Verify ZKP</Menu.Item>
        </Menu.Menu>
      </Menu>
    </Segment>
  )
}