import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	showModal: false,
	editingPlace: null,
	newCoord: { lat: 0, lon: 0 },
	form: {
		name: '',
		description: '',
		iconUrl: '',
		imageFile: null
	},
	editForm: {
		name: '',
		description: ''
	}
}

export const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		setShowModal: (state, action) => {
			state.showModal = action.payload
		},
		setEditingPlace: (state, action) => {
			state.editingPlace = action.payload
		},
		setNewCoord: (state, action) => {
			state.newCoord = action.payload
		},
		setForm: (state, action) => {
			state.form = { ...state.form, ...action.payload }
		},
		resetForm: state => {
			state.form = initialState.form
		},
		setEditForm: (state, action) => {
			state.editForm = { ...state.editForm, ...action.payload }
		},
		resetEditForm: state => {
			state.editForm = initialState.editForm
		},
		clearEditingPlace: state => {
			state.editingPlace = null
		}
	}
})

export const {
	setShowModal,
	setEditingPlace,
	setNewCoord,
	setForm,
	resetForm,
	setEditForm,
	resetEditForm,
	clearEditingPlace
} = uiSlice.actions

export default uiSlice.reducer
