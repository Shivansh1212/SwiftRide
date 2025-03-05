import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
    setLoading(false);
  }, [isLoaded, form]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1">
        <ImageBackground
          source={images.signUpCar}
          style={{ width: "100%", height: 250 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent"]}
            style={{ flex: 1, justifyContent: "flex-end", padding: 20 }}
          >
            <Text className="text-2xl text-white font-Jakarta mb-10">Welcome back👋</Text>
          </LinearGradient>
        </ImageBackground>

        <View className="px-5 -mt-10">
          <View className="bg-white rounded-2xl shadow-lg p-5">
            <InputField
              label="Email"
              placeholder="Enter email"
              icon={icons.email}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
            />

            <InputField
              label="Password"
              placeholder="Enter password"
              icon={icons.lock}
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
            />

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#4CAF50"
                className="mt-6"
              />
            ) : (
              <CustomButton
                title="Sign In"
                onPress={onSignInPress}
                className="mt-6 bg-primary-500"
              />
            )}

            <OAuth />

            <View className="mt-4 flex-row justify-center">
              <Text className="text-base text-gray-600">
                Don't have an account?{" "}
              </Text>
              <Link
                href="/sign-up"
                className="text-base text-primary-500 font-semibold"
              >
                Sign Up
              </Link>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
