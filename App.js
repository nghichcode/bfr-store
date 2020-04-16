import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import React from 'react';

import Login from './app/components/login.js';
import Home from './app/components/home.js';

const Stack = createStackNavigator();

class App extends React.Component {
  render() {
    return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{title: null, headerShown: false}} />
        <Stack.Screen name="Login" component={Login} options={{title: null, headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
    );
  }
}


export default App;
