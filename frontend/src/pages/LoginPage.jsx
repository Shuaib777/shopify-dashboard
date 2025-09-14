import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/apiConfig";
import { UserContext } from "../context/UserContext";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputs, setInputs] = useState({
    email: "",
    accessToken: "",
  });

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      console.log(inputs);
      const res = await axios.post(`${API_URL}/api/tenant/login`, inputs, {
        withCredentials: true,
      });

      const data = res.data;

      if (data.success) {
        setUser(data.tenant);
        localStorage.setItem("tenant", JSON.stringify(data.tenant));
        navigate("/dashboard");
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Login failed. Please check your credentials or server.");
    }
  };

  return (
    <Flex
      align={"center"}
      justify={"center"}
      minH="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Tenant Login
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.800")}
          boxShadow={"lg"}
          p={8}
          w={{ base: "full", md: "400px" }}
        >
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="text"
                value={inputs.email}
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
              />
            </FormControl>
            <FormControl id="accessToken" isRequired>
              <FormLabel>Access Token</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={inputs.accessToken}
                  onChange={(e) =>
                    setInputs({ ...inputs, accessToken: e.target.value })
                  }
                />
                <InputRightElement h={"full"}>
                  <Button
                    variant={"ghost"}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={4}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={useColorModeValue("blue.600", "blue.700")}
                color={"white"}
                _hover={{ bg: useColorModeValue("blue.700", "blue.800") }}
                onClick={handleLogin}
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default LoginPage;
