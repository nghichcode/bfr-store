import {StyleSheet, TouchableOpacity} from 'react-native';
import React from "react";

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
  mt4:{marginTop:4,},
  mt2:{marginTop:2,},mb2:{marginBottom:2,},
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
  fstRoundBtn:{position:'absolute',right:16,bottom:16,alignItems:'center',justifyContent:'center',zIndex:9},
  roundBlueBtn:{
    alignItems:'center',justifyContent:'center',
    width:60,height:60,borderRadius:30,
    backgroundColor:'#3f51b5',
    shadowColor: '#000000',shadowOffset:  { width: 10, height: 10 },
    elevation: 6,shadowOpacity: 1,shadowRadius: 6,
  },
  roundCornerBtn:{
    alignItems:'center',justifyContent:'center',
    width:48,height:22,borderRadius:4
  },
  roundCornerPad:{width:48,height:22},
  roundCornerInp:{
    alignItems:'center',justifyContent:'center',borderWidth: 1,borderRadius:4,
    width:48,height:32,paddingBottom:0
  },

  orange:{color:'#ffa184'},
  white: {color:"#ffffff"},
  black: {color:"#000000"},
  red: {color:"#fb5b5a",},
  info: {color:"#3f51b5",},
  warning: {color:"#ff9800",},
  success: {color:"#4caf50",},

  bgwhite: {backgroundColor:"#ffffff",},
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
  badge_txt:{borderRadius: 10,paddingHorizontal: 4},

});

export {
  styles
};
