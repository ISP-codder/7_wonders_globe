import { configureStore } from '@reduxjs/toolkit'
import wondersReducer from './slices/wondersSlice'
import uiReducer from './slices/uiSlice'
import dynamicIslandReducer from './slices/dynamicIslandSlice'
import wonderInfoBoxReducer from './slices/wonderInfoBoxSlice'

export const store = configureStore({
	reducer: {
		wonders: wondersReducer,
		ui: uiReducer,
		dynamicIsland: dynamicIslandReducer,
		wonderInfoBox: wonderInfoBoxReducer
	}
})

export default store
