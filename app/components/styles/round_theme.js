import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff2d6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:{
    fontWeight:"bold",
    fontSize:50,
    color:"#fb5b5a",
    marginBottom:40
  },

  cards_list : {
    zIndex: 0,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor:'#fff',
  },
  card_row : {flex:1,marginHorizontal: 4},
  card : {
    alignSelf:'center',
    marginBottom: 10,
    padding: 10,
    width: '100%',
    height: 'auto',
    borderWidth: 0,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset:  { width: 20, height: 20 },
    elevation: 10,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    backgroundColor:'#ff5722',
  },

  text20c: {fontSize:20,textAlign:'center'},
  textBold: {fontWeight:'bold'},
  // ADD
  mb20:{marginBottom:20,},
  mb5:{marginBottom:5,},
  mx2p:{marginHorizontal:'2%'},
  mt40:{marginTop:40,},
  w80p:{width:"80%",},
  w100p:{width:"100%",},

  label:{paddingLeft:10,fontSize: 16,fontWeight: 'bold'},

  roundInput:{
    backgroundColor:"#ffa184",
    borderRadius:25,
    height:50,
    justifyContent:"center",
    padding:20
  },
  input50:{height:50,color:"white",},

  roundBtn:{
    borderRadius:25,height:50,alignItems:"center",justifyContent:'center',marginBottom:10
  },

  orange:{color:'#ffa184'},
  white: {color:"#ffffff"},
  black: {color:"#000000"},
  red: {color:"#fb5b5a",},
  info: {color:"#3f51b5",},
  warning: {color:"#ff9800",},
  success: {color:"#4caf50",},

  bgred: {backgroundColor:"#fb5b5a",},
  bginfo: {backgroundColor:"#3f51b5",},
  bgwarning: {backgroundColor:"#ff9800",},
  bgsuccess: {backgroundColor:"#4caf50",},

  center:{alignItems:'center',textAlign:'center'},
  rowcenter:{flexDirection: 'row',justifyContent:'center',alignItems: 'center'},

  header_container:{flex:0,flexDirection:'row',alignItems:'center'},
  header_bar:{
    height:60,width:'100%',backgroundColor:'#3f51b5',paddingHorizontal:8,
    flexDirection: 'row',justifyContent:'space-between',alignItems: 'center'
  },
  header_title:{fontSize:20,lineHeight:20},
  w40:{width:40},
});

export {
  styles
};
