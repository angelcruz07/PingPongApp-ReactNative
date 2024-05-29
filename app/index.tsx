import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Game from '../components/Game'

export default function Index() {
	return (
		<GestureHandlerRootView style={styles.container}>
			<Game />
		</GestureHandlerRootView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		alignItems: 'center',
		justifyContent: 'center'
	}
})
