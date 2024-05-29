import { useEffect } from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	Easing
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

export default function Index() {
	const { height, width } = useWindowDimensions()

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

		if (nextPos.y < 0 || nextPos.y > height - BALL_WIDTH) {
			const newDirection = { x: direction.value.x, y: -direction.value.y }
			direction.value = newDirection
			nextPos = getNextPosition(newDirection)
		}

		if (nextPos.x < 0 || nextPos.x > width - BALL_WIDTH) {
			const newDirection = { x: -direction.value.x, y: direction.value.y }
			direction.value = newDirection
			nextPos = getNextPosition(newDirection)
		}

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
				console.log('Hitting from the side')
				const newDirection = { x: -direction.value.x, y: direction.value.y }
				direction.value = newDirection
				nextPos = getNextPosition(newDirection)
			} else {
				console.log('Touch the top/bottom side of the island')
				const newDirection = { x: direction.value.x, y: -direction.value.y }
				direction.value = newDirection
				nextPos = getNextPosition(newDirection)
			}
		}

		// if (
		// 	nextPos.y < islandDimensions.y + islandDimensions.h &&
		// 	BALL_WIDTH + nextPos.y > islandDimensions.y
		// ) {
		// 	console.log('Touch the top/bottom side of the island')
		// 	const newDirection = { x: -direction.value.x, y: direction.value.y }
		// 	direction.value = newDirection
		// 	nextPos = getNextPosition(newDirection)
		// } else {
		// 	//No colision
		// }

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
	return (
		<View style={styles.container}>
			<Animated.View style={[styles.ball, ballAnimatedStyles]} />
			<View style={styles.paddle}></View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
