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
  useToast, // Switched from alert to useToast for better UI
  Card, // ✅ Import the Card component
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/apiConfig";
import { UserContext } from "../context/UserContext";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    email: "",
    accessToken: "",
  });

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/tenant/login`, inputs, {
        withCredentials: true,
      });
      const data = res.data;

      if (data.success) {
        setUser(data.tenant);
        localStorage.setItem("tenant", JSON.stringify(data.tenant));
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: data.message,
          status: "error",
        });
      }
    } catch (err) {
      toast({
        title: "Login Error",
        description: "Please check credentials or server.",
        status: "error",
      });
      console.error("Error logging in:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align={"center"} justify={"center"} minH="100vh">
      <Card maxW={"lg"} w={{ base: "full", md: "420px" }}>
        <CardHeader>
          <Heading textAlign={"center"}>Tenant Login</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={6}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="text"
                value={inputs.email}
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
                placeholder="tenant@example.com"
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
                  placeholder="shpat_xxxxxxxxxx"
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
            <Stack pt={4}>
              <Button
                variant="gradient"
                size="lg"
                onClick={handleLogin}
                isLoading={loading}
                loadingText="Logging In..."
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default LoginPage;
