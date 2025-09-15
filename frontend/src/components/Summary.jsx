import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  HStack,
  VStack,
  Icon,
  Skeleton,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MdAttachMoney, MdPeople, MdShoppingCart } from "react-icons/md";
import axios from "axios";
import API_URL from "../config/apiConfig";

const Summary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const subtitleColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/insight/summary`, {
          withCredentials: true,
        });

        if (response.status === 200 && response.data.success) {
          setSummaryData(response.data.insights);
        } else {
          throw new Error("Failed to fetch summary data");
        }
      } catch (error) {
        toast({
          title: "Error fetching summary",
          description: "Unable to load dashboard summary",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error("Summary fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [toast]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US").format(number);
  };

  const summaryCards = [
    {
      title: "Total Revenue",
      value: summaryData ? formatCurrency(summaryData.totalRevenue) : "₹0",
      icon: MdAttachMoney,
      iconBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      percentage: "+12%",
      isPositive: true,
    },
    {
      title: "Total Customers",
      value: summaryData ? formatNumber(summaryData.totalCustomers) : "0",
      icon: MdPeople,
      iconBg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      percentage: "+8%",
      isPositive: true,
    },
    {
      title: "Total Orders",
      value: summaryData ? formatNumber(summaryData.totalOrders) : "0",
      icon: MdShoppingCart,
      iconBg: "linear-gradient(135deg, #00d4aa 0%, #00f2fe 100%)",
      percentage: "+15%",
      isPositive: true,
    },
  ];

  if (loading) {
    return (
      <Box px={8} py={6}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={2}>
                    <Skeleton height="20px" width="120px" />
                    <Skeleton height="32px" width="100px" />
                    <Skeleton height="16px" width="60px" />
                  </VStack>
                  <Skeleton boxSize="48px" borderRadius="xl" />
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  return (
    <Box px={8} py={6}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            _hover={{
              transform: "translateY(-2px)",
              transition: "all 0.3s ease",
            }}
          >
            <CardBody>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={2} flex={1}>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={subtitleColor}
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {card.title}
                  </Text>

                  <Text fontSize="2xl" fontWeight="bold" lineHeight="shorter">
                    {card.value}
                  </Text>

                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={card.isPositive ? "green.400" : "red.400"}
                  >
                    {card.percentage}
                  </Text>
                </VStack>

                <Box
                  p={3}
                  borderRadius="xl"
                  background={card.iconBg}
                  boxShadow="lg"
                >
                  <Icon as={card.icon} boxSize={6} color="white" />
                </Box>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Summary;
