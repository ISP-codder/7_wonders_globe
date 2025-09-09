import { createSlice } from '@reduxjs/toolkit'
import { wonders } from '../../data/wonders'

// Загрузка пользовательских чудес из localStorage
const loadCustomWonders = () => {
	const saved = localStorage.getItem('customWonders')
	return saved ? JSON.parse(saved) : []
}

const initialState = {
	wonders: wonders,
	customWonders: loadCustomWonders(),
	selectedWonderId: null
}

export const wondersSlice = createSlice({
	name: 'wonders',
	initialState,
	reducers: {
		setSelectedWonder: (state, action) => {
			state.selectedWonderId = action.payload
		},
		clearSelectedWonder: state => {
			state.selectedWonderId = null
		},
		addCustomWonder: (state, action) => {
			state.customWonders.push(action.payload)
			localStorage.setItem('customWonders', JSON.stringify(state.customWonders))
		},
		updateCustomWonder: (state, action) => {
			const { id, name, description } = action.payload
			const wonder = state.customWonders.find(w => w.id === id)
			if (wonder) {
				wonder.name = name
				wonder.description = description
				localStorage.setItem(
					'customWonders',
					JSON.stringify(state.customWonders)
				)
			}
		},
		deleteCustomWonder: (state, action) => {
			state.customWonders = state.customWonders.filter(
				w => w.id !== action.payload
			)
			localStorage.setItem('customWonders', JSON.stringify(state.customWonders))

			// Если удаляем выбранное чудо, сбрасываем выбор
			if (state.selectedWonderId === action.payload) {
				state.selectedWonderId = null
			}
		}
	}
})

export const {
	setSelectedWonder,
	clearSelectedWonder,
	addCustomWonder,
	updateCustomWonder,
	deleteCustomWonder
} = wondersSlice.actions

export default wondersSlice.reducer
