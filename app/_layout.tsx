import {SplashScreen, Stack} from "expo-router";
import "../global.css"
import { useFonts} from "expo-font";
import {useEffect} from "react";
import { AuthProvider } from "@/app/(auth)/AuthProvider";

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
      <Stack screenOptions={{ headerShown: false }}/>
    </AuthProvider>
  );
}
