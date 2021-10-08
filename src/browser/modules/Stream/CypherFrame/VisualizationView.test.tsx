/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import { render } from '@testing-library/react'
import neo4j from 'neo4j-driver'
import { Visualization } from './VisualizationView'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

const mockStore = configureMockStore()
const store = mockStore({
  frames: {}
})

function renderWithRedux(children: any) {
  return render(<Provider store={store}>{children}</Provider>)
}
const mockEmptyResult = {
  records: []
}
const node = new (neo4j.types.Node as any)('1', ['Person'], {
  prop1: '<b>String</b> with HTML <strong>in</strong> it'
})
const mockResult = {
  records: [{ keys: ['0'], __fields: [node], get: (_key: any) => node }]
}

test('Visualization renders', () => {
  const { container } = renderWithRedux(
    <Visualization result={mockEmptyResult} />
  )
  expect(container).toMatchSnapshot()
})
test('Visualization renders with result and escapes any HTML', () => {
  const { container } = renderWithRedux(
    <Visualization updateStyle={() => {}} autoComplete result={mockResult} />
  )
  expect(container).toMatchSnapshot()
})
