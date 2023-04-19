import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import fonts from '../../../utils/commonStyles/fonts'
import { Card } from 'react-native-paper';

const LearningSegmentControlUI = ({ route, ...props }) => {

  const segmentClicked = (segmentType) => {
    props.segmentClicked(segmentType)
  };

  return (
    <View>
      <Card style={{ margin: 5 }}>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

          <TouchableOpacity onPress={() => segmentClicked(props.SegmentType.Faqs)} style={[props.selectionSegmentType == props.SegmentType.Faqs ? styles.segmentButtonSelectionStyle : styles.segmentButtonStyle]}>
            <Text style={props.selectionSegmentType == props.SegmentType.Faqs ? [styles.segmentButtonSelectionTextStyle] : [styles.segmentButtonTextStyle]}>FAQ's</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => segmentClicked(props.SegmentType.Videos)} style={[props.selectionSegmentType == props.SegmentType.Videos ? styles.segmentButtonSelectionStyle : styles.segmentButtonStyle]}>
            <Text style={props.selectionSegmentType == props.SegmentType.Videos ? [styles.segmentButtonSelectionTextStyle] : [styles.segmentButtonTextStyle]}>Videos</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => segmentClicked(props.SegmentType.UserGuides)} style={[props.selectionSegmentType == props.SegmentType.UserGuides ? styles.segmentButtonSelectionStyle : styles.segmentButtonStyle]}>
            <Text style={props.selectionSegmentType == props.SegmentType.UserGuides ? [styles.segmentButtonSelectionTextStyle] : [styles.segmentButtonTextStyle]}>User Guides</Text>
          </TouchableOpacity>

        </View>

      </Card>

    </View>
  );
}

export default LearningSegmentControlUI;

const styles = StyleSheet.create({

  segmentButtonStyle: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45a934',
  },

  segmentButtonSelectionStyle: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a4fba3',
  },

  segmentButtonTextStyle: {
    color: 'white',
    fontSize: fonts.fontMedium
  },

  segmentButtonSelectionTextStyle: {
    color: '#45a934',
    fontSize: fonts.fontMedium
  },

});