import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
	setSelectedWonder,
	clearSelectedWonder,
	addCustomWonder,
	updateCustomWonder,
	deleteCustomWonder
} from '../store/slices/wondersSlice'
import {
	setShowModal,
	setEditingPlace,
	setNewCoord,
	setForm,
	resetForm,
	setEditForm,
	resetEditForm,
	clearEditingPlace
} from '../store/slices/uiSlice'
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
import '../styles/Map.css'
import { wonders } from '../data/wonders'
import WonderInfoBox from './WonderInfoBox'

Ion.defaultAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkZDk4NWUyNi04ZDI4LTRkZDEtOGQ1MS0xZjM5NjhiNTFlOTUiLCJpZCI6Mjk5Mzc3LCJpYXQiOjE3NDYzNTQxNDF9.6zJNJwg-Vh__6AuKKdYaww60Cko13-Ljtsi7A7tXVvY'

export default function CesiumMap() {
	const containerRef = useRef(null)
	const viewerRef = useRef(null)
	const dispatch = useDispatch()

	const { selectedWonderId, customWonders } = useSelector(
		state => state.wonders
	)
	const { showModal, newCoord, form, editForm, editingPlace } = useSelector(
		state => state.ui
	)
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

		wonders.forEach(w => {
			viewer.entities.add({
				id: w.id,
				name: w.name,
				position: Cartesian3.fromDegrees(w.lon, w.lat),
				billboard: { image: w.icon, width: 32, height: 32 },
				description: w.description
			})
		})

		customWonders.forEach(w => {
			viewer.entities.add({
				id: w.id,
				name: w.name,
				position: Cartesian3.fromDegrees(w.lon, w.lat),
				billboard: { image: w.icon, width: 32, height: 32 },
				description: w.description
			})
		})

		const handler = new ScreenSpaceEventHandler(viewer.scene.canvas)
		handler.setInputAction(evt => {
			const picked = viewer.scene.pick(evt.position)

			if (picked?.id) {
				dispatch(setSelectedWonder(picked.id.id))
			} else {
				const cartesian = viewer.scene.camera.pickEllipsoid(
					evt.position,
					viewer.scene.globe.ellipsoid
				)
				if (!cartesian) return
				const carto = Cartographic.fromCartesian(cartesian)
				const lon = Number(CesiumMath.toDegrees(carto.longitude).toFixed(6))
				const lat = Number(CesiumMath.toDegrees(carto.latitude).toFixed(6))

				dispatch(setNewCoord({ lat, lon }))
				dispatch(setShowModal(true))
			}
		}, ScreenSpaceEventType.LEFT_CLICK)

		return () => {
			handler.destroy()
			viewer.destroy()
		}
	}, [customWonders, dispatch])

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

		dispatch(addCustomWonder(newWonder))
		dispatch(setShowModal(false))
		dispatch(resetForm())
	}

	const startEditing = place => {
		dispatch(setEditingPlace(place))
		dispatch(setEditForm({ name: place.name, description: place.description }))
	}

	const handleEditSubmit = e => {
		e.preventDefault()
		const viewer = viewerRef.current

		const entity = viewer.entities.getById(editingPlace.id)
		if (entity) {
			entity.name = editForm.name
			entity.description = editForm.description
		}

		dispatch(
			updateCustomWonder({
				id: editingPlace.id,
				name: editForm.name,
				description: editForm.description
			})
		)
		dispatch(clearEditingPlace())
		dispatch(resetEditForm())
	}

	const cancelEditing = () => {
		dispatch(clearEditingPlace())
		dispatch(resetEditForm())
	}

	const deletePlace = placeId => {
		const viewer = viewerRef.current

		viewer.entities.removeById(placeId)
		dispatch(deleteCustomWonder(placeId))
	}
	return (
		<>
			<div ref={containerRef} style={{ width: '100%', height: '100vh' }} />

			<WonderInfoBox
				selectedId={selectedWonderId}
				onClose={() => dispatch(clearSelectedWonder())}
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
								onChange={e => dispatch(setForm({ name: e.target.value }))}
								required
							/>
							<textarea
								placeholder='Описание'
								value={form.description}
								onChange={e =>
									dispatch(setForm({ description: e.target.value }))
								}
								required
							/>
							<input
								type='url'
								placeholder='URL иконки (необязательно)'
								value={form.iconUrl}
								onChange={e => dispatch(setForm({ iconUrl: e.target.value }))}
							/>
							<input
								type='file'
								accept='image/*'
								onChange={e =>
									dispatch(setForm({ imageFile: e.target.files[0] }))
								}
							/>
							<div style={{ marginTop: '10px', textAlign: 'right' }}>
								<button
									type='button'
									onClick={() => dispatch(setShowModal(false))}>
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
								onChange={e => dispatch(setEditForm({ name: e.target.value }))}
								required
							/>
							<textarea
								placeholder='Описание'
								value={editForm.description}
								onChange={e =>
									dispatch(setEditForm({ description: e.target.value }))
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
