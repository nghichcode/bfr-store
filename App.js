import 'react-native-gesture-handler';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import React from 'react';
import {
  View,
  Text,
  // Button
} from 'react-native';
import { Button, SearchBar } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

class Home extends React.Component {
	constructor(props) {
    super(props);
		this.state = {
			search: '',
		};
	}
	updateSearch = search => {
    this.setState({ search });
  };

	render() {
		const { search } = this.state;
		const {navigation} = this.props;
	  return (
	  	<View>
	  		<View style={{flex: 1, backgroundColor:'#CCC', flexDirection: "row", flexWrap:'wrap', paddingHorizontal:'2%', paddingTop: 2}}>
		  		<View style={{flex: 10,}}>
			  		<SearchBar
			  			lightTheme={true}
			        placeholder="Type Here..."
			        onChangeText={this.updateSearch}
			        value={search}
			      />
	      	</View>
	      	<View style={{flex: 2, backgroundColor: '#FCF'}}>
			    	<Text style={{
			    		borderTopWidth: 1,
					    borderBottomWidth: 1,
					    borderBottomColor: '#000',
					    borderTopColor: '#000',
					    padding: 8,
					    backgroundColor: '#CBC',

					    borderBottomWidth: 0,
					    borderRadius: 3,
					    overflow: 'hidden',
					    minHeight: 30,

			    	}}
			    	><Ionicons name='ios-barcode' size={30} color='#000' /></Text>
	      	</View>
	      </View>
	      <View>
			    <Button
			      title="Go to Jane's profile"
			      onPress={() => navigation.navigate('Profile', {name: 'Jane'})}
			      containerStyle={{marginHorizontal:'10%', marginBottom:2, width:'80%', backgroundColor: 'red'}}
			    />
			    <Button
			      title="Nest"
			      onPress={() => navigation.navigate('Nest', {name: 'Jane'})}
			      style={{margin:2, width:'80%'}}
			    />
			    <View style={{margin:2}}>
			    	<Text>
			    		<Ionicons name='ios-football' size={20} color='#CFC' />
			    	</Text>
			    	<Text>
			    		{this.state.search}
			    	</Text>		    	
			    </View>
		    </View>
	    </View>
	  );
	}
}

class Profile extends React.Component {
	render() {
		const {navigation} = this.props;
	  return (
	    <Button
	      title="Go to Jane's home"
	      onPress={() => navigation.navigate('Nest', {name: 'Jane'})}
	    />
	  );
	}
}

class Feed extends React.Component {
	render() {
		const {navigation} = this.props;
	  return (
	  	<View>
	  		<Text>Feed</Text>
	  	</View>
	  );
	}
}
class Messages extends React.Component {
	render() {
		const {navigation} = this.props;
	  return (
	  	<View>
	  		<Text>Messages</Text>
	  	</View>
	  );
	}
}


function Nest() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
	      tabBarIcon: ({ focused, color, size }) => {
	        let iconName;

	        if (route.name === 'Feed') {
	          iconName = focused
	            ? 'ios-information-circle'
	            : 'ios-information-circle-outline';
	        } else if (route.name === 'Messages') {
	          iconName = focused ? 'ios-list-box' : 'ios-list';
	        }
	        return <Ionicons name={iconName} size={size} color={color} />;
	      },
	    })}

      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen name="Messages" component={Messages} />
    </Tab.Navigator>
  );
}

class App extends React.Component {
	render() {
	  return (
	    <NavigationContainer>
	      <Stack.Navigator>
	        <Stack.Screen
	          name="Home"
	          component={Home}
	          options={{
	          	title: 'Welcome', headerShown: true,
	          	header: ({ scene, previous, navigation }) => {
							  return (
						  		<View style={{backgroundColor:'#CCC'}}>
							  		<View style={{width: '90%'}}>
								  		<SearchBar
								  			lightTheme={true}
								        placeholder="Type Here..."
								      />
						      	</View>
						      	<View style={{
						      		position: 'absolute',
						      		right: 0,top: 0,width: '10%',height: '100%',
						      		backgroundColor: '#e6e8ec'}}>
								    	<Text style={{marginVertical: 12}}
								    	><Ionicons name='ios-barcode' size={30} color='#000' /></Text>
						      	</View>
						      </View>
							  );
							},
	        	}}
	        />
	        <Stack.Screen name="Profile" component={Profile}
	        	options={{
	        		title: 'Welcome', headerStyle: {backgroundColor: '#ff5722'},
	        		headerTitleStyle: {color: '#fcfcfc'},
	        		headerTintColor: '#fcfcfc',
	        		headerRight: () => (
		            <Button
		              onPress={() => alert('This is a button!')}
		              title="Info"
		              color="#fff"
		            />
		          ),
	        	}}
	        />
	        <Stack.Screen name="Nest" component={Nest} />
	      </Stack.Navigator>
	    </NavigationContainer>
	  );
	}
}


export default App;
