import React from 'react';
import {View,Text,TouchableOpacity} from 'react-native';
import {SearchBar} from 'react-native-elements';

import { Camera } from 'expo-camera';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {normalize} from '../../utils.js';
import {debounce} from '../../underscore_nano.js';

class SearchBarATC extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',proccessing:false,
      count_text: 0,
      list: [],
      is_scan:false,
      hasCameraPermission:null,
      flash:false,
    };
    const self = this;
    const {fetchData} = props;
    this._debounce = debounce((text)=>{
      if(fetchData) {fetchData(text.trim(), self.fetchSuccess);}
    }, 1600);
  }

  async componentDidMount() {
    this.mounted = true;
    if(this.mounted) {
      const { status } = await Camera.requestPermissionsAsync();
      this.setState({ hasCameraPermission: status === 'granted' });
      if (this.props.get_all) { this.onChangeText(''); }
    }
  }
  componentWillUnmount(){this.mounted = false;}

  onChangeText = (text, force_update=false) => {
    const self = this;
    const {search,list,count_text} = this.state;//Include text
    const {onChangeText,fetchData,resultData,get_all} = this.props;
    if(onChangeText) {onChangeText(text);}

    const count = text.split(' ').filter((it)=>it).length;
    this.setState({ proccessing:true });
    if(count==0) {//Empty
      if (get_all) {//All
        if(fetchData) {fetchData(text.trim(), this.fetchSuccess);}
      } else {resultData([]); this.setState({proccessing:false}); }
      this.setState({ search:text,count_text:count});
      return;
    }

    if(list.length>0 && count==count_text && search && text.includes(search)) {
      let normal_txt = normalize(text);
      let tmp_list = list.filter((it) => {
        return it.product_name.includes(text)
        ||it.gtin_code.includes(text)
        ||it.product_name_alpha.includes(normal_txt);
      });
      this.setState({search:text,count_text:count,proccessing:false,list:tmp_list});
      resultData(tmp_list);
      return;
    }

    if ( count!=count_text) {//Has Change
      if(fetchData) {fetchData(text.trim(), this.fetchSuccess);}
    } else {this._debounce(text);}
    this.setState({search:text,count_text:count});
  }
  fetchSuccess = (list) => {
    if(!list){this.setState({proccessing:false});}
    else {this.setState({list,proccessing:false});}
    return list;
  }

  barcodeRecognized = (barcodes, is_scan=false) => {
    if(this.props.barcodeRecognized) {this.props.barcodeRecognized(barcodes, is_scan);}
    if(barcodes) {
      this.onChangeText(barcodes.data);
    }
    this.setState({is_scan});
  }

  render() {
    const {is_scan,flash,hasCameraPermission,proccessing} = this.state;
    const {show_scan,children,reload} = this.props;
    const search = this.state.search || this.props.search;

    if (is_scan || show_scan) {
      return(
        <View style={{height:'100%'}}>
        {!hasCameraPermission &&
          <Text style={{textAlign:'center'}}>Vui lòng cấp quyền camera.</Text>
        }
        {hasCameraPermission &&
          <Camera style={{height:'100%',width: '100%',zIndex:16}}
            type={Camera.Constants.Type.back}
            flashMode={flash?Camera.Constants.FlashMode.torch:Camera.Constants.FlashMode.off}
            onBarCodeScanned={ this.barcodeRecognized }>
              <View 
              style={{marginBottom:10, display:'flex',flex:1,flexDirection:'column-reverse',alignItems:'center'}}
              >
                <View style={{flex:0,flexDirection:'row', marginBottom:4}}>
                  <TouchableOpacity onPress={()=>{this.barcodeRecognized(false);}}
                  style={{flex:3,backgroundColor:"#4caf50",marginHorizontal: '5%',
                    borderRadius:25,height:50,alignItems:"center",justifyContent:'center',marginBottom:10
                  }}>
                    <Text style={{color:"#ffffff"}}>Đóng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>{this.setState({flash:!flash});}}
                  style={{flex:0,backgroundColor:"#4caf50",marginHorizontal: '5%',width:40,
                    borderRadius:25,height:50,alignItems:"center",justifyContent:'center',marginBottom:10
                  }}>
                    <Text style={{color:"#ffffff"}}><Ionicons name='ios-flash' size={20} color='#fff'/></Text>
                  </TouchableOpacity>
                </View>
              </View>
          </Camera>
        }
        </View>
      );
    }

    return (
    <View style={{backgroundColor: '#f44336cc', height:'100%'}}>
      <View style={{height: 60}}>
        <View style={{width: '90%'}}>
          <SearchBar
            lightTheme={true}
            placeholder="Vui lòng nhập..."
            containerStyle={{
              backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,
              borderBottomColor: '#ddd',borderTopColor: '#ddd',
            }}
            inputContainerStyle={{backgroundColor: '#eee',height:'100%'}}
            onChangeText={this.onChangeText}
            onFocus={()=>this.onChangeText(search?search:'')}
            value={ search }
          />
        </View>
        <View style={{
          position: 'absolute',right: 0, top: 0, width: '10%', height: '100%',
          flex: 1,flexDirection: 'row',justifyContent: 'center',alignItems: 'center',
          backgroundColor: '#fff',borderTopWidth: 1,borderBottomWidth: 1,
          borderBottomColor: '#ddd',borderTopColor: '#ddd',
        }}>
          <View style={{padding:0, margin:0,marginRight:6}} >
            <Icon name='qrcode' size={40} color='gray'
              onPress={()=>{this.barcodeRecognized(null,true);}}
            />
          </View>
        </View>
      </View>
      <View style={{position:'absolute',top:60,left:0,right:0,bottom:0}}>
      {proccessing?
        <Text style={{textAlign:'center',color:'#ffffff'}}>Đang tìm kiếm...</Text>
        :children
      }
      {reload &&
      <View style={{
        position:'absolute',right:16,bottom:16,alignItems:'center',justifyContent:'center',zIndex:9
      }}
      >
        <TouchableOpacity
        onPress={()=>this.onChangeText('')}
        style={{
          alignItems:'center',justifyContent:'center',
          width:60,height:60,borderRadius:30,
          backgroundColor:'#3f51b5',
          shadowColor: '#000000',shadowOffset:  { width: 10, height: 10 },
          elevation: 6,shadowOpacity: 1,shadowRadius: 6,
         }}>
          <Icon name='refresh' size={30} color='#fff'/>
        </TouchableOpacity>
      </View>
      }

      </View>
    </View>
    );
  }
}

export default SearchBarATC;