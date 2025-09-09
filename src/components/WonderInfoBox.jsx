import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import api from '../constants/api-globe'
import { wonders as staticWonders } from '../data/wonders'
import {
	setItem,
	setLikesCount,
	setUserLiked,
	setComments,
	setNewComment,
	resetNewComment,
	addComment,
	clearState
} from '../store/slices/wonderInfoBoxSlice'
import '../styles/WonderInfoBox.css'

export default function WonderInfoBox({
	selectedId,
	onClose,
	onEditPlace,
	onDeletePlace
}) {
	const { item, likesCount, userLiked, comments, newComment } = useSelector(
		state => state.wonderInfoBox
	)
	const dispatch = useDispatch()

	useEffect(() => {
		if (!selectedId) {
			dispatch(clearState())
			return
		}

		const found = staticWonders.find(w => w.id === selectedId)
		if (found) {
			dispatch(
				setItem({
					id: found.id,
					name: found.name,
					image: found.image,
					description: found.description
				})
			)
		} else {
			const ent = window.viewer?.entities.getById(selectedId)
			if (ent) {
				const name = ent.name
				let description = ''
				if (ent.description) {
					const p = ent.description
					description = typeof p.getValue === 'function' ? p.getValue() : p
				}
				const image = ent.billboard?.image
				dispatch(setItem({ id: ent.id, name, image, description }))
			}
		}

		// Загружаем лайки и комментарии только для стандартных чудес
		if (!selectedId.startsWith('custom-')) {
			api
				.get(`/wonders/${selectedId}/likes`)
				.then(({ data }) => {
					dispatch(setLikesCount(data.count))
					dispatch(setUserLiked(data.userLiked))
				})
				.catch(() => {})

			api
				.get(`/wonders/${selectedId}/comments`)
				.then(({ data }) => dispatch(setComments(data)))
				.catch(() => dispatch(setComments([])))
		} else {
			// Для пользовательских мест очищаем лайки и комментарии
			dispatch(setLikesCount(0))
			dispatch(setUserLiked(false))
			dispatch(setComments([]))
		}
	}, [selectedId, dispatch])

	const handleCommentSubmit = async e => {
		e.preventDefault()
		if (!newComment.trim() || selectedId.startsWith('custom-')) return
		try {
			const { data } = await api.post(`/wonders/${selectedId}/comments`, {
				text: newComment
			})
			dispatch(addComment(data))
			dispatch(resetNewComment())
		} catch (err) {
			console.error('Ошибка при добавлении комментария', err)
		}
	}

	const isCustomWonder = selectedId?.startsWith('custom-')

	if (!item) return null

	return (
		<div className='wonder-info'>
			<button className='close-btn' onClick={onClose}>
				×
			</button>
			<h2>{item.name}</h2>
			{item.image && <img src={item.image} alt={item.name} width='100%' />}
			<p>{item.description}</p>

			<div className='like-section'>
				{onEditPlace && (
					<button
						className='edit-place-btn'
						onClick={() => onEditPlace(item)}
						style={{
							marginLeft: '10px',
							padding: '5px 10px',
							background: '#2196F3',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}>
						Редактировать
					</button>
				)}
				{onDeletePlace && (
					<button
						className='delete-place-btn'
						onClick={() => onDeletePlace(item.id)}
						style={{
							marginLeft: '10px',
							padding: '5px 10px',
							background: '#f44336',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer'
						}}>
						Удалить
					</button>
				)}
			</div>

			{!isCustomWonder && (
				<div className='comments'>
					<h3>Комментарии</h3>
					{comments.length > 0 ? (
						<ul className='comment-list'>
							{comments.map(c => (
								<li key={c.id} className='comment-item'>
									<strong>{c.authorName || 'Пользователь'}:</strong> {c.text}
								</li>
							))}
						</ul>
					) : (
						<p className='no-comments'>Комментариев пока нет.</p>
					)}
					<form className='comment-form' onSubmit={handleCommentSubmit}>
						<input
							className='comment-input'
							type='text'
							placeholder='Оставить комментарий...'
							value={newComment}
							onChange={e => dispatch(setNewComment(e.target.value))}
						/>
						<button type='submit' className='comment-submit'>
							Отправить
						</button>
					</form>
				</div>
			)}
		</div>
	)
}
