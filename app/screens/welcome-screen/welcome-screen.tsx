import * as React from 'react';
import { View, ViewStyle, TextStyle, SafeAreaView } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Text } from '../../components/text';
import { Button } from '../../components/button';
import { Screen } from '../../components/screen';
import { Wallpaper } from '../../components/wallpaper';
import { color, spacing } from '../../theme';

const FULL: ViewStyle = { flex: 1 };
const CONTAINER: ViewStyle = {
  backgroundColor: color.transparent,
  paddingHorizontal: spacing[4],
};
const TEXT: TextStyle = {
  color: color.palette.white,
  fontFamily: 'Montserrat',
};
const BOLD: TextStyle = { fontWeight: 'bold' };
const TITLE_WRAPPER: TextStyle = {
  ...TEXT,
  textAlign: 'center',
  paddingTop: spacing[3],
  paddingBottom: spacing[4] + spacing[1],
};
const TITLE: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 28,
  lineHeight: 38,
  textAlign: 'center',
};
const CONTENT: TextStyle = {
  ...TEXT,
  color: '#BAB6C8',
  fontSize: 15,
  lineHeight: 22,
  marginBottom: spacing[5],
};
const CONTINUE: ViewStyle = {
  paddingVertical: spacing[4],
  paddingHorizontal: spacing[4],
  backgroundColor: '#5D2555',
};
const CONTINUE_TEXT: TextStyle = {
  ...TEXT,
  ...BOLD,
  fontSize: 13,
  letterSpacing: 2,
};
const FOOTER: ViewStyle = { backgroundColor: '#20162D' };
const FOOTER_CONTENT: ViewStyle = {
  paddingVertical: spacing[5],
  paddingHorizontal: spacing[4],
};

export interface WelcomeScreenProps extends NavigationScreenProps<{}> {}

export const WelcomeScreen: React.FunctionComponent<WelcomeScreenProps> = props => {
  const nextScreen = React.useMemo(() => () => props.navigation.navigate('devices'), [
    props.navigation,
  ]);

  return (
    <View style={FULL}>
      <Wallpaper />
      <Screen style={CONTAINER} preset='scroll' backgroundColor={color.transparent}>
        <Text style={TITLE_WRAPPER}>
          <Text style={TITLE} text='Clock Application' />
        </Text>
        <Text style={CONTENT}>
          This probably isn't what your app is going to look like. Unless your designer handed you
          this screen and, in that case, congrats! You're ready to ship.
        </Text>
      </Screen>
      <SafeAreaView style={FOOTER}>
        <View style={FOOTER_CONTENT}>
          <Button
            style={CONTINUE}
            textStyle={CONTINUE_TEXT}
            text='Discover'
            onPress={nextScreen}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
