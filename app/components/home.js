import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

import {TokenSchema,UserSchema,StoreSchema,ROLE} from '../models/models.js';
import {getUser} from '../models/model_utils.js';
import SearchTab from './tabs/search.js';
import StoreTab from './tabs/store.js';
import DetailTab from './tabs/detail.js';
import AdminTab from './tabs/admin.js';

const Tab = createBottomTabNavigator();

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      role:ROLE['guest']
    };
  }


  async componentDidMount() {
    const user_data = getUser(this.props.realm);
    var {role} = this.state;
    if(user_data && user_data.user && user_data.user.permission_id) {
      role = user_data.user.permission_id;
    }
    this.setState({role});
  }

  tabs_data = function(){
    const tabs={
      admin:{name:'Admin', icon:'user'},
      store:{name:'Cửa Hàng', icon:'home'},
      search:{name:'Tìm Kiếm', icon:'search'},
      calc:{name:'Tính Toán', icon:'calculator'},
      detail:{name:'Thông Tin', icon:'address-card'},
    };
    const getIconByName = function(name, dicon='') {
      for(t in tabs){if(name===tabs[t].name) return tabs[t].icon;}
      return dicon || 'home';
    }
    return {tabs, getIconByName};
  }

  logout = () => {
    const {setLogin,realm} = this.props;
    realm.write(() => {
      realm.delete(realm.objects(TokenSchema.name));
      realm.delete(realm.objects(UserSchema.name));
      realm.delete(realm.objects(StoreSchema.name));
    });
    setLogin(false);
  }

  render() {
    const {realm} = this.props;
    const {tabs,getIconByName} = this.tabs_data();
    return (
  	<NavigationContainer>
	    <Tab.Navigator
	      initialRouteName={tabs.search.name}
	      screenOptions={({route}) => ({
	        tabBarIcon: ({focused, color, size}) => {
	          let iconName=getIconByName(route.name);
	          return <Icon name={iconName} size={size} color={color}/>;
	        },
	      })}
	      tabBarOptions={{
	        activeTintColor: 'tomato',inactiveTintColor: 'gray',
	      }}
	    >
        {this.state.role==ROLE['admin'] &&
	      <Tab.Screen name={tabs.admin.name}>
          {props => <AdminTab {...props} realm={realm} />}
        </Tab.Screen>
        }
        <Tab.Screen name={tabs.store.name}>
          {props => <StoreTab {...props} realm={realm} />}
        </Tab.Screen>
	      <Tab.Screen name={tabs.search.name}>
	       {props => <SearchTab {...props} realm={realm} />}
	      </Tab.Screen>
	      <Tab.Screen name={tabs.detail.name}>
	        {props => <DetailTab {...props} realm={realm} logout={this.logout}/>}
	      </Tab.Screen>
	    </Tab.Navigator>
    </NavigationContainer>
    );
  }
}

export default Home;