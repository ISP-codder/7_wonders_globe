import React, { useEffect, useRef, useState } from 'react'
import {
	Ion,
	Viewer,
	Cartesian3,
	Cartographic,
	Math as CesiumMath,
	ScreenSpaceEventHandler,
	ScreenSpaceEventType
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import '../styles/components/Map.css'
import { wonders } from '../data/wonders'
import WonderInfoBox from './WonderInfoBox'

Ion.defaultAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZDk4NWUyNi04ZDI4LTRkZDEtOGQ1MS0xZjM5NjhiNTFlOTUiLCJpZCI6Mjk5Mzc3LCJpYXQiOjE3NDYzNTQxNDF9.6zJNJwg-Vh__6AuKKdYaww60Cko13-Ljtsi7A7tXVvY'

export default function CesiumMap() {
	const containerRef = useRef(null)
	const viewerRef = useRef(null)

	const [selectedId, setSelectedId] = useState(null)
	const [showModal, setShowModal] = useState(false)
	const [newCoord, setNewCoord] = useState({ lat: 0, lon: 0 })
	const [form, setForm] = useState({
		name: '',
		description: '',
		iconUrl: '',
		imageFile: null
	})
	const [customWonders, setCustomWonders] = useState([])
	const [editingPlace, setEditingPlace] = useState(null)
	const [editForm, setEditForm] = useState({ name: '', description: '' })
	useEffect(() => {
		const viewer = new Viewer(containerRef.current, {
			timeline: false,
			animation: false,
			baseLayerPicker: false,
			fullscreenButton: false,
			homeButton: true,
			geocoder: true,
			infoBox: false,
			sceneModePicker: false,
			selectionIndicator: false,
			navigationHelpButton: false
		})
		viewerRef.current = viewer
		window.viewer = viewer
	}, [])
	useEffect(() => {
		const savedCustomWonders = localStorage.getItem('customWonders')
		if (savedCustomWonders) {
			try {
				const parsedWonders = JSON.parse(savedCustomWonders)
				setCustomWonders(parsedWonders)
			} catch (error) {
				console.error('Ошибка при загрузке пользовательских чудес:', error)
			}
		}

		const viewer = new Viewer(containerRef.current, {
			timeline: false,
			animation: false,
			baseLayerPicker: false,
			fullscreenButton: false,
			homeButton: true,
			geocoder: true,
			infoBox: false,
			sceneModePicker: false,
			selectionIndicator: false,
			navigationHelpButton: false
		})
		viewerRef.current = viewer
		window.viewer = viewer

		wonders.forEach(w => {
			viewer.entities.add({
				id: w.id,
				name: w.name,
				position: Cartesian3.fromDegrees(w.lon, w.lat),
				billboard: { image: w.icon, width: 32, height: 32 },
				description: w.description
			})
		})

		if (savedCustomWonders) {
			try {
				const parsedWonders = JSON.parse(savedCustomWonders)
				parsedWonders.forEach(w => {
					viewer.entities.add({
						id: w.id,
						name: w.name,
						position: Cartesian3.fromDegrees(w.lon, w.lat),
						billboard: { image: w.icon, width: 32, height: 32 },
						description: w.description
					})
				})
			} catch (error) {
				console.error(
					'Ошибка при добавлении пользовательских чудес на карту:',
					error
				)
			}
		}

		const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
		handler.setInputAction(evt => {
			const picked = viewer.scene.pick(evt.position)

			if (picked?.id) {
				setSelectedId(picked.id.id)
			} else {
				const cartesian = viewer.scene.camera.pickEllipsoid(
					evt.position,
					viewer.scene.globe.ellipsoid
				)
				if (!cartesian) return
				const carto = Cartographic.fromCartesian(cartesian)
				const lon = Number(CesiumMath.toDegrees(carto.longitude).toFixed(6))
				const lat = Number(CesiumMath.toDegrees(carto.latitude).toFixed(6))

				setNewCoord({ lat, lon })
				setShowModal(true)
			}
		}, ScreenSpaceEventType.LEFT_CLICK)

		return () => {
			handler.destroy()
			viewer.destroy()
		}
	}, [])

	const handleSubmit = e => {
		e.preventDefault()
		const viewer = viewerRef.current
		const id = `custom-${Date.now()}`

		const newWonder = {
			id,
			name: form.name,
			lat: newCoord.lat,
			lon: newCoord.lon,
			icon:
				form.iconUrl ||
				'https://img.icons8.com/ios-filled/50/000000/marker.png',
			description: form.description
		}

		viewer.entities.add({
			id,
			name: form.name,
			position: Cartesian3.fromDegrees(newCoord.lon, newCoord.lat),
			billboard: {
				image: newWonder.icon,
				width: 32,
				height: 32
			},
			description: form.description
		})

		const updatedCustomWonders = [...customWonders, newWonder]
		setCustomWonders(updatedCustomWonders)
		localStorage.setItem('customWonders', JSON.stringify(updatedCustomWonders))

		setShowModal(false)
		setForm({ name: '', description: '', iconUrl: '', imageFile: null })
	}

	const startEditing = place => {
		setEditingPlace(place)
		setEditForm({ name: place.name, description: place.description })
	}

	const handleEditSubmit = e => {
		e.preventDefault()
		const viewer = viewerRef.current

		const entity = viewer.entities.getById(editingPlace.id)
		if (entity) {
			entity.name = editForm.name
			entity.description = editForm.description
		}

		const updatedCustomWonders = customWonders.map(wonder =>
			wonder.id === editingPlace.id
				? { ...wonder, name: editForm.name, description: editForm.description }
				: wonder
		)

		setCustomWonders(updatedCustomWonders)
		localStorage.setItem('customWonders', JSON.stringify(updatedCustomWonders))
		setEditingPlace(null)
		setEditForm({ name: '', description: '' })
	}

	const cancelEditing = () => {
		setEditingPlace(null)
		setEditForm({ name: '', description: '' })
	}

	const deletePlace = placeId => {
		const viewer = viewerRef.current

		viewer.entities.removeById(placeId)

		const updatedCustomWonders = customWonders.filter(
			wonder => wonder.id !== placeId
		)
		setCustomWonders(updatedCustomWonders)
		localStorage.setItem('customWonders', JSON.stringify(updatedCustomWonders))

		if (selectedId === placeId) {
			setSelectedId(null)
		}
	}
	return (
		<>
			<div ref={containerRef} style={{ width: '100%', height: '100vh' }} />

			<WonderInfoBox
				selectedId={selectedId}
				onClose={() => setSelectedId(null)}
				onEditPlace={startEditing}
				onDeletePlace={deletePlace}
			/>

			{showModal && (
				<div className='modal-backdrop'>
					<div className='modal-content'>
						<h3>Новое чудо света</h3>
						<p>
							Координаты: {newCoord.lat}, {newCoord.lon}
						</p>
						<form onSubmit={handleSubmit}>
							<input
								type='text'
								placeholder='Название'
								value={form.name}
								onChange={e => setForm({ ...form, name: e.target.value })}
								required
							/>
							<textarea
								placeholder='Описание'
								value={form.description}
								onChange={e =>
									setForm({ ...form, description: e.target.value })
								}
								required
							/>
							<input
								type='url'
								placeholder='URL иконки (необязательно)'
								value={form.iconUrl}
								onChange={e => setForm({ ...form, iconUrl: e.target.value })}
							/>
							<input
								type='file'
								accept='image/*'
								onChange={e =>
									setForm({ ...form, imageFile: e.target.files[0] })
								}
							/>
							<div style={{ marginTop: '10px', textAlign: 'right' }}>
								<button type='button' onClick={() => setShowModal(false)}>
									Отмена
								</button>{' '}
								<button type='submit'>Сохранить</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{editingPlace && (
				<div className='modal-backdrop'>
					<div className='modal-content'>
						<h3>Редактирование места</h3>
						<form onSubmit={handleEditSubmit}>
							<input
								type='text'
								placeholder='Название'
								value={editForm.name}
								onChange={e =>
									setEditForm({ ...editForm, name: e.target.value })
								}
								required
							/>
							<textarea
								placeholder='Описание'
								value={editForm.description}
								onChange={e =>
									setEditForm({ ...editForm, description: e.target.value })
								}
								required
							/>
							<div style={{ marginTop: '10px', textAlign: 'right' }}>
								<button type='button' onClick={cancelEditing}>
									Отмена
								</button>{' '}
								<button type='submit'>Сохранить изменения</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
