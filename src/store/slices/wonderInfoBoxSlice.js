import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	item: null,
	likesCount: 0,
	userLiked: false,
	comments: [],
	newComment: ''
}

export const wonderInfoBoxSlice = createSlice({
	name: 'wonderInfoBox',
	initialState,
	reducers: {
		setItem: (state, action) => {
			state.item = action.payload
		},
		setLikesCount: (state, action) => {
			state.likesCount = action.payload
		},
		setUserLiked: (state, action) => {
			state.userLiked = action.payload
		},
		setComments: (state, action) => {
			state.comments = action.payload
		},
		setNewComment: (state, action) => {
			state.newComment = action.payload
		},
		resetNewComment: state => {
			state.newComment = ''
		},
		addComment: (state, action) => {
			state.comments.push(action.payload)
		},
		clearState: state => {
			state.item = null
			state.comments = []
			state.likesCount = 0
			state.userLiked = false
		}
	}
})

export const {
	setItem,
	setLikesCount,
	setUserLiked,
	setComments,
	setNewComment,
	resetNewComment,
	addComment,
	clearState
} = wonderInfoBoxSlice.actions

export default wonderInfoBoxSlice.reducer
