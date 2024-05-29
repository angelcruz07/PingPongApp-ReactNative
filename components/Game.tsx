import React, { useEffect } from 'react'
import {
	View,
	StyleSheet,
	useWindowDimensions,
	BackHandler
} from 'react-native'
import {
	GestureHandlerRootView,
	PanGestureHandler
} from 'react-native-gesture-handler'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	Easing,
	useAnimatedGestureHandler
} from 'react-native-reanimated'

const FPS = 60
const DELTA = 1000 / FPS
const SPEED = 10
const BALL_WIDTH = 25

const islandDimensions = { x: 150, y: 11, w: 127, h: 37 }

const normalizeVector = (vector: { x: number; y: number }) => {
	const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y)

	return {
		x: vector.x / magnitude,
		y: vector.y / magnitude
	}
}

export default function Game() {
	const { height, width } = useWindowDimensions()
	const playerDimensions = {
		x: width / 4,
		y: height - 150,
		w: width / 2,
		h: 37
	}

	const targetPositionX = useSharedValue(width / 2)
	const targetPositionY = useSharedValue(height / 2)
	const direction = useSharedValue(
		normalizeVector({ x: Math.random(), y: Math.random() })
	)

	useEffect(() => {
		const interval = setInterval(update, DELTA)

		return () => {
			clearInterval(interval)
		}
	}, [])

	const update = () => {
		let nextPos = getNextPosition(direction.value)
		let newDirection = direction.value

		// Wall hit detection
		if (nextPos.y < 0 || nextPos.y > height - BALL_WIDTH) {
			newDirection = { x: direction.value.x, y: -direction.value.y }
		}

		if (nextPos.x < 0 || nextPos.x > width - BALL_WIDTH) {
			newDirection = { x: -direction.value.x, y: direction.value.y }
		}

		//Island hit detection
		if (
			nextPos.x < islandDimensions.x + islandDimensions.w &&
			nextPos.x + BALL_WIDTH > islandDimensions.x &&
			nextPos.y < islandDimensions.y + islandDimensions.h &&
			BALL_WIDTH + nextPos.y > islandDimensions.y
		) {
			if (
				targetPositionX.value < islandDimensions.x ||
				targetPositionX.value > islandDimensions.x + islandDimensions.w
			) {
				newDirection = { x: -direction.value.x, y: direction.value.y }
			} else {
				newDirection = { x: direction.value.x, y: -direction.value.y }
			}
		}

		direction.value = newDirection
		nextPos = getNextPosition(newDirection)

		targetPositionX.value = withTiming(nextPos.x, {
			duration: DELTA,
			easing: Easing.linear
		})
		targetPositionY.value = withTiming(nextPos.y, {
			duration: DELTA,
			easing: Easing.linear
		})
	}
	const getNextPosition = (direction: { x: number; y: number }) => {
		return {
			x: targetPositionX.value + direction.x * SPEED,
			y: targetPositionY.value + direction.y * SPEED
		}
	}

	const ballAnimatedStyles = useAnimatedStyle(() => {
		return {
			top: targetPositionY.value,
			left: targetPositionX.value
		}
	})

	const gestureHandler = useAnimatedGestureHandler({
		onStart: (event, ctx) => {
			ctx.startX = targetPositionX.value
			ctx.startY = targetPositionY.value
		},
		onActive: (event, ctx) => {
			targetPositionX.value = ctx.startX + event.translationX
			targetPositionY.value = ctx.startY + event.translationY
		}
	})

	return (
		<View style={styles.container}>
			<Animated.View style={[styles.ball, ballAnimatedStyles]} />
			{/* Island */}
			<View style={styles.paddle}></View>
			{/* Player */}
			<Animated.View
				style={{
					position: 'absolute',
					top: playerDimensions.y,
					left: playerDimensions.x,
					width: playerDimensions.w,
					height: playerDimensions.h,
					borderRadius: 20,
					backgroundColor: '#fff'
				}}></Animated.View>
			<PanGestureHandler onGestureEvent={gestureHandler}>
				<View
					style={{
						width: '100%',
						height: 200,
						position: 'absolute',
						bottom: 0
					}}></View>
			</PanGestureHandler>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		backgroundColor: '#000',
		alignItems: 'center',
		justifyContent: 'center'
	},
	ball: {
		position: 'absolute',
		width: BALL_WIDTH,
		aspectRatio: 1,
		borderRadius: 25,
		backgroundColor: '#fff'
	},
	paddle: {
		top: islandDimensions.y,
		left: islandDimensions.x,
		width: islandDimensions.w,
		height: islandDimensions.h,
		position: 'absolute',
		bottom: 30,
		borderRadius: 20,
		backgroundColor: '#fff'
	}
	// score: {
	//   position: 'absolute',
	//   top: 50,
	//   color: '#fff',
	//   fontSize: 20,
	// },
})
