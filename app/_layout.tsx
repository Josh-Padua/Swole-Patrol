import {SplashScreen, Stack} from "expo-router";
import "../global.css"
import { useFonts} from "expo-font";
import {useEffect} from "react";
import { AuthProvider } from "@/context/AuthProvider";
// import {StripeProvider} from "@stripe/stripe-react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Lato-Bold": require('../assets/fonts/Lato-Bold.ttf'),
    "Lato-Light": require('../assets/fonts/Lato-Light.ttf'),
    "Lato-Medium": require('../assets/fonts/Lato-Medium.ttf'),
    "Lato-Regular": require('../assets/fonts/Lato-Regular.ttf'),
    "Lato-Semibold": require('../assets/fonts/Lato-Semibold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      {/*<StripeProvider*/}
      {/*    publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}*/}
      {/*>*/}
      <Stack screenOptions={{ headerShown: false }}/>
      {/*</StripeProvider>*/}
    </AuthProvider>
  );
}
