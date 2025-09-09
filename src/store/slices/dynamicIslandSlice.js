import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	expanded: false,
	searchQuery: ''
}

export const dynamicIslandSlice = createSlice({
	name: 'dynamicIsland',
	initialState,
	reducers: {
		setExpanded: (state, action) => {
			state.expanded = action.payload
		},
		setSearchQuery: (state, action) => {
			state.searchQuery = action.payload
		},
		resetSearchQuery: state => {
			state.searchQuery = ''
		}
	}
})

export const { setExpanded, setSearchQuery, resetSearchQuery } =
	dynamicIslandSlice.actions

export default dynamicIslandSlice.reducer
