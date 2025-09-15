import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  HStack,
  useColorModeValue,
  useColorMode,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { MdLogout, MdLightMode, MdDarkMode } from "react-icons/md";
import axios from "axios";
import API_URL from "../config/apiConfig";

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const headerBg = useColorModeValue(
    "light.bg.headerGradient",
    "dark.bg.headerGradient"
  );
  const textColor = useColorModeValue("gray.800", "white");
  const breadcrumbColor = useColorModeValue("gray.500", "gray.400");

  const handleSignout = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/tenant/logout`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        logout();
        toast({
          title: "Logged out successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      background={headerBg}
      px={8}
      py={4}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex justify="space-between" align="center">
        {/* Left Side */}
        <HStack spacing={2}>
          <Text fontSize="sm" color={breadcrumbColor} fontWeight="normal">
            Pages /
          </Text>
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Dashboard
          </Text>
        </HStack>

        {/* Right Side */}
        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MdDarkMode /> : <MdLightMode />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
            color={useColorModeValue("gray.600", "gray.300")}
            _hover={{
              color: useColorModeValue("gray.800", "white"),
              bg: useColorModeValue("gray.100", "rgba(255, 255, 255, 0.1)"),
            }}
          />

          <Button
            leftIcon={<MdLogout />}
            variant="ghost"
            onClick={handleSignout}
            size="sm"
            color={useColorModeValue("gray.600", "gray.300")}
            _hover={{
              color: useColorModeValue("gray.800", "white"),
              bg: useColorModeValue("gray.100", "rgba(255, 255, 255, 0.1)"),
            }}
            fontSize="sm"
          >
            Signout
          </Button>

          <Avatar
            size="sm"
            name={user?.email || "Tenant User"}
            bg={useColorModeValue("purple.500", "purple.500")}
            color="white"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
