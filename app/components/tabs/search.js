import React from 'react';
import {View,FlatList,Alert,StatusBar,TouchableOpacity,ScrollView} from 'react-native';
import {Text, Card, Button, SearchBar, ListItem, Divider, Input} from 'react-native-elements';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import config from '../../config.js';
import {parseForm,crd2m} from '../../utils.js';
import { getUser } from '../../models/model_utils.js';


class SearchTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      hideResult:false,
      is_scan:false,
      item:{},
    };
  }

  updateSearch = search => {
    this.setState({search});
  };
  handleResult = (item) => {
    if (!item) {
      this.setState({hideResult:false,item:{}});
    } else {
      this.setState({hideResult:true,item:item});
    }
  }
  handleBarcode = (is_scan) => {
    this.setState({is_scan});
  }

  render() {
    const {search,hideResult,item,is_scan} = this.state;
    const {setState} = this;
    const {realm} = this.props;

    return (
      <View style={{height:'100%'}}>
        <StatusBar backgroundColor="#ff9800" />
        <SearchBarATC realm={realm}
          onChangeText={this.updateSearch} handleResult={this.handleResult}
          handleBarcode={this.handleBarcode}
        />
        {search==='' && !is_scan &&
        (
          <View style={{paddingTop: 5,}}>
            <Text style={{textAlign:'center'}}>Chưa có kết quả.</Text>
          </View>
        )}
        {search!=='' && !is_scan && hideResult && item.product_name && (
        <ScrollView style={{position:'absolute',top:60,left:0,right:0,bottom:0}}>
          <Card
            title={item.product_name}
            image={{uri: config.getImge(item.img_url)}}
            imageProps={{ containerStyle:{height:400} }}
            containerStyle={{marginBottom:8}}
          >
            <View style={{marginHorizontal:8}}>
              <Divider/>

              <View style={{marginTop:4}}>
                <Text h4>Thông tin sản phẩm</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Giá:</Text><Text>{item.price}</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Mã:</Text><Text>{item.gtin_code}</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Mô tả:</Text><Text>{item.description}</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Nơi sản xuất:</Text><Text>{item.party_name}</Text>
                <Divider/>
              </View>

              <View style={{marginTop:4}}>
                <Text h4>Thông tin cửa hàng</Text>
                <Divider/>
              </View>
              {item.store_id &&
              <View>
                <View style={{marginTop:4}}>
                  <Text style={{fontWeight:'bold'}}>Tên cửa hàng:</Text><Text>{item.storename}</Text>
                  <Divider/>
                </View>
                <View style={{marginTop:4}}>
                  <Text style={{fontWeight:'bold'}}>Số lượng:</Text><Text>{item.quantity}</Text>
                  <Divider/>
                </View>
                <View style={{marginTop:4}}>
                  <Text style={{fontWeight:'bold'}}>Ngày hết hạn:</Text><Text>{item.exp?item.exp.split(' ')[0]:''}</Text>
                  <Divider/>
                </View>
              </View>
              }

              {!item.store_id &&
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Đây là sản phẩm gốc.</Text>
                <Divider/>
              </View>
              }

              <View style={{marginTop:4}}>
                <Text h4>Thông tin liên hệ</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Thành phố:</Text><Text>{item.city}</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Địa chỉ sản xuất 1:</Text><Text>{item.street_address_one}</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Địa chỉ sản xuất 2:</Text><Text>{item.street_address_two}</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Địa chỉ sản xuất 3:</Text><Text>{item.street_address_three}</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Email:</Text><Text>{item.email}</Text>
                <Divider/>
              </View>
              <View style={{marginTop:4}}>
                <Text style={{fontWeight:'bold'}}>Số điện thoại:</Text><Text>{item.phone}</Text>
                <Divider/>
              </View>

            </View>
          </Card>
        </ScrollView>
        )}
      </View>
    );
  }
}

class SearchBarATC extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      isEmpty: true,
      hideResult:true,
      is_scan:false,
      hasCameraPermission:null,
      user_location:'',
      flash:false,
      count_text: 0,
      list: []
    };
  }

  async componentDidMount() {
    const { status } = await Camera.requestPermissionsAsync();
    this.setState({ hasCameraPermission: status === 'granted' });
    this.setLocation();
  }

  setLocation = () => {
    const {store} = getUser(this.props.realm);
    if(store && store.location){
      this.setState({user_location:store.location});
    }
  }

  onChangeText = text => {
    if(!this.state.user_location){this.setLocation();}
    const count = text.split(' ').filter((it)=>it).length;
    const {onChangeText} = this.props;
    onChangeText(text);
    if(!text) {
      this.setState({ isEmpty: text === '',search: text,hideResult:true,count_text:count });
      return;
    }

    const {search,list,count_text} = this.state;
    if(count>count_text && search && text.includes(search)) {
      console.log('search.js:1!',count,count_text, search);
      this.setState({
        isEmpty: text === '',search: text,hideResult:false,
        list: list.filter((it) => { return it.product_name.includes(text)||it.gtin_code.includes(text); })
      });
      this.props.handleResult(null);
      return;
    }

    this.setState({isEmpty: text === '',search: text,hideResult:false});
    this.props.handleResult(null);
    if ( count!=count_text ) {
      console.log('search.js:2',count,count_text, search, text);
      this.setState({count_text:count});
      const params = {
        limit: 100,
        offset : 0,
        store_search:0,
        search : text,
      };
      fetch(config.getLocation('search/search_store_product/'), {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        body: parseForm(params),
      })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        if(json.error) {
          Alert.alert("Lỗi", json.message+' : '+json.code,[{text: "OK"}],{ cancelable: false });
        } else {
          var data = [];
          data = data.concat(json.store_products?json.store_products.data:[]);
          data = data.concat(json.products?json.products.data:[]);
          this.setState({list:data});
        }
      })
      .catch((error) => {
        this.setState({processing:false});
        Alert.alert("Lỗi", error.message,[{text: "OK", onPress: () => null}],{ cancelable: false });
      });
    }
  };

  barcodeRecognized = (barcodes) => {
    this.onChangeText(barcodes.data);
    this.handleBarcode(false);
  }
  handleBarcode = (is_scan) => {
    this.props.handleBarcode(is_scan);
    this.setState({is_scan});
  }

  handleResult = (item) => {
    console.log('search.js:11');
    this.setState({hideResult:true});
    this.props.handleResult(item);
  }

  render() {
    const {search,isEmpty,hideResult,is_scan,flash,user_location} = this.state;
    const {navigation,handleResult,handleBarcode} = this.props;

    if (is_scan) {
      return(
        <View style={{height:'100%'}}>
          <Camera style={{height:'100%',width: '100%',}}
            type={Camera.Constants.Type.back}
            flashMode={flash?Camera.Constants.FlashMode.torch:Camera.Constants.FlashMode.off}
            onBarCodeScanned={ this.barcodeRecognized }>
              <View 
              style={{marginBottom:10, display:'flex',flex:1,flexDirection:'column-reverse',alignItems:'center'}}
              >
                <View style={{flex:0,flexDirection:'row', marginBottom:4}}>
                  <Button
                    title='Đóng'
                    onPress={()=>{this.handleBarcode(false);}}
                    containerStyle={{
                      flex:3,marginHorizontal: '5%',
                    }}
                    buttonStyle={{height:40,}}
                  />
                  <Button
                    title='' icon={<Ionicons name='ios-flash' size={20} color='#fff'/>}
                    onPress={()=>{this.setState({flash:!flash});}}
                    containerStyle={{
                      flex:0,marginHorizontal: '5%',
                    }}
                    buttonStyle={{
                      height:40,padding:0, margin:0,width:40
                    }}
                  />
                </View>
              </View>
          </Camera>

        </View>
      );
    }

    return (
    <View style={{backgroundColor: '#ffa', height:isEmpty || hideResult?'auto':'100%'}}>
      <View style={{backgroundColor: '#ffc',height: 60}}>
        <View style={{width: '90%'}}>
          <SearchBar
            lightTheme={true}
            placeholder="Type Here..."
            containerStyle={{backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,borderBottomColor: '#ddd',borderTopColor: '#ddd',}}
            inputContainerStyle={{backgroundColor: '#eee',height:'100%'}}
            onChangeText={this.onChangeText}
            value={search}
          />
        </View>
        <View style={{
          position: 'absolute',right: 0, top: 0, width: '10%', height: '100%',
          flex: 1,flexDirection: 'row',justifyContent: 'center',alignItems: 'center',
          backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,borderBottomColor: '#ddd',borderTopColor: '#ddd',
        }}>
          <Button
            title="" onPress={()=>{this.handleBarcode(true);}}
            icon={<Icon name='qrcode' size={40} color='#000'/>}
            type="clear"
            buttonStyle={{padding:0, margin:0,marginRight:6,height:'100%'}}
          />
        </View>
      </View>
      { !isEmpty && !hideResult &&
      (
        <View style={{position:'absolute',top:60,left:0,right:0,bottom:0}}>
        <FlatList
          initialNumToRender={this.state.list.length}
          keyExtractor={(item, index) => index.toString()}
          data={this.state.list}
          renderItem={({ item, index }) => (
            <ListItem
              title={item.product_name}
              rightTitle={
                <Text>
                  {item.is_approved>0 && <Icon name='check' size={10} color='tomato'/>}
                  {item.is_trusted>0 && <Icon name='star' size={10} color='tomato'/>}
                </Text>
              }
              subtitle={item.storename}
              rightSubtitle={item.price}
              leftAvatar={{ source: { uri: config.getImge(item.img_url) } }}
              badge={{
                value: (
                  !user_location
                  ?'Không rõ'
                  :item.location
                    ?crd2m(user_location, item.location)+'m'
                    :item.store_id?'Không rõ':'Sản phẩm gốc'
                  ),
                status: "error"
              }}
              bottomDivider
              chevron
              onPress={() => {this.handleResult(item);}}
            />
          )}
        />
        </View>
      )
      }
    </View>
    );
  }
}

export default SearchTab;