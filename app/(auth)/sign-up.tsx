import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { ReactNativeModal } from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.name
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
    setLoading(false);
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
    setLoading(false);
  };

  return (
    <ScrollView className="flex-1">
      <View className="flex-1 bg-white">
        <ImageBackground
          source={images.signUpCar}
          style={{ width: "100%", height: 250 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent"]}
            style={{ flex: 1, justifyContent: "flex-end", padding: 20 }}
          >
            <Text className="text-2xl mb-10 text-white font-Jakarta">
              Create Your Account
            </Text>
          </LinearGradient>
        </ImageBackground>

        <View className="px-5 -mt-10">
          <View className="bg-white rounded-2xl shadow-lg p-5">
            <InputField
              label="Name"
              placeholder="Enter name"
              icon={icons.person}
              value={form.name}
              onChangeText={(value) => setForm({ ...form, name: value })}
            />
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
                title="Sign Up"
                onPress={onSignUpPress}
                className="mt-6 bg-primary-500"
              />
            )}

            <OAuth />
            <View className="mt-4 flex-row justify-center">
              <Text className="text-base text-gray-600">
                Already have an account?{" "}
              </Text>
              <Link
                href="/sign-in"
                className="text-base text-primary-500 font-semibold"
              >
                Log In
              </Link>
            </View>
          </View>
        </View>

        {/* Verification Modal */}
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          backdropOpacity={0.5}
          style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl w-11/12">
            <Text className="font-bold text-2xl mb-2">Email Verification</Text>
            <Text className="text-base text-gray-600 mb-5">
              A verification code has been sent to {form.email}. Please enter
              the code below.
            </Text>
            <InputField
              label="Verification Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#4CAF50"
                className="mt-5"
              />
            ) : (
              <CustomButton
                title="Verify Email"
                onPress={onPressVerify}
                className="mt-5 bg-success-500"
              />
            )}
          </View>
        </ReactNativeModal>

        {/* Success Modal */}
        <ReactNativeModal
          isVisible={showSuccessModal}
          backdropOpacity={0.5}
          style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl w-11/12 items-center">
            <Image source={images.check} className="w-[110px] h-[110px] mb-5" />
            <Text className="text-3xl font-bold text-center">Verified!</Text>
            <Text className="text-base text-gray-500 text-center mt-2">
              Your account has been successfully verified.
            </Text>
            <CustomButton
              title="Browse Home"
              onPress={() => router.push(`/(root)/(tabs)/home`)}
              className="mt-5 bg-primary-500"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;