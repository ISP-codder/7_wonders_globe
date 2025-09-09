import React, { useEffect, useState } from 'react'
import api from '../api'
import { wonders as staticWonders } from '../data/wonders'
import './WonderInfoBox.css'

export default function WonderInfoBox({
	selectedId,
	onClose,
	onEditPlace,
	onDeletePlace
}) {
	const [item, setItem] = useState(null)
	const [likesCount, setLikesCount] = useState(0)
	const [userLiked, setUserLiked] = useState(false)
	const [comments, setComments] = useState([])
	const [newComment, setNewComment] = useState('')

	useEffect(() => {
		if (!selectedId) {
			setItem(null)
			setComments([])
			setLikesCount(0)
			setUserLiked(false)
			return
		}

		const found = staticWonders.find(w => w.id === selectedId)
		if (found) {
			setItem({
				id: found.id,
				name: found.name,
				image: found.image,
				description: found.description
			})
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
				setItem({ id: ent.id, name, image, description })
			}
		}

		api
			.get(`/wonders/${selectedId}/likes`)
			.then(({ data }) => {
				setLikesCount(data.count)
				setUserLiked(data.userLiked)
			})
			.catch(() => {})

		api
			.get(`/wonders/${selectedId}/comments`)
			.then(({ data }) => setComments(data))
			.catch(() => setComments([]))
	}, [selectedId])

	const handleLike = async () => {
		try {
			if (userLiked) {
				await api.delete(`/wonders/${selectedId}/likes`)
				setLikesCount(c => c - 1)
			} else {
				await api.post(`/wonders/${selectedId}/likes`)
				setLikesCount(c => c + 1)
			}
			setUserLiked(l => !l)
		} catch (err) {
			console.error('Ошибка при лайке', err)
		}
	}

	const handleCommentSubmit = async e => {
		e.preventDefault()
		if (!newComment.trim()) return
		try {
			const { data } = await api.post(`/wonders/${selectedId}/comments`, {
				text: newComment
			})
			setComments(prev => [...prev, data])
			setNewComment('')
		} catch (err) {
			console.error('Ошибка при добавлении комментария', err)
		}
	}

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
						onChange={e => setNewComment(e.target.value)}
					/>
					<button type='submit' className='comment-submit'>
						Отправить
					</button>
				</form>
			</div>
		</div>
	)
}
