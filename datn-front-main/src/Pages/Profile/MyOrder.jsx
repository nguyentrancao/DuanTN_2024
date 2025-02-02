import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Divider,
  Image,
  Center,
  Flex,
  Button,
  Badge,
  VStack,
  useDisclosure,
  useToast,
  Input,
  Accordion,
  AccordionItem,
  AccordionPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Select,
  InputGroup,
  // InputLeftElement,
} from "@chakra-ui/react";
import "react-slideshow-image/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { Icon } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import "react-slideshow-image/dist/styles.css";
import { ArrowBackIcon } from "@chakra-ui/icons";
import UserInfo from "./UserInfo";
import { BsFillCartCheckFill, BsFillTrashFill } from "react-icons/bs";
import { AiFillCreditCard } from "react-icons/ai";
import { RiProfileLine } from "react-icons/ri";
import { FaMapMarkerAlt } from "react-icons/fa";
import Cookies from "js-cookie";
import axios from "axios";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchProvinces, fetchDistricts } from '../../Redux/province';
const MyOrder = () => {
  const userID = Cookies.get("userID");
  const [products, setProducts] = useState([]);
  const username = Cookies.get("username");
  const address = useRef({});
  const toast = useToast();
  const isMobile = window.innerWidth <= 768;
  const [selectedOrderCode, setSelectedOrderCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_DATABASE_API_URL}/orders/user/${userID}`,
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const renderProducts = () => {
    let productsByOrderCode = products.reduce((acc, product) => {
      if (!acc[product.orderCode]) {
        acc[product.orderCode] = [product];
      } else {
        acc[product.orderCode].push(product);
      }
      return acc;
    }, {});

    const handleOrderCodeClick = (orderCode) => {
      setSelectedOrderCode((prevOrderCode) =>
        prevOrderCode === orderCode ? null : orderCode,
      );
    };

    const formatCurrency = (amount) => {
      // Format the amount as currency, you may want to use a library for this
      // Example: using Intl.NumberFormat
      const formatter = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      });

      return formatter.format(amount);
    };
    const processedOrderCodes = new Set();
    const totalExpenditure = Object.values(productsByOrderCode)
      .flat()
      .reduce((total, product) => {
        if (!processedOrderCodes.has(product.orderCode)) {
          processedOrderCodes.add(product.orderCode);
          return total + product.totalPay;
        }
        return total;
      }, 0);
    const handleCancelOrder = (infoID) => {
      if (window.confirm("Bạn có thật sự muốn hủy đơn")) {
        axios.put(
          `${process.env.REACT_APP_DATABASE_API_URL}/orders/update-order/${infoID}`,
          {
            status: "Đã hủy",
          },
        );
        window.location.reload();
      }
    };

    return (
      <Box>
        <React.Fragment>
          {Object.entries(productsByOrderCode)
            .slice(currentPage * 5, (currentPage + 1) * 5)
            .map(([orderCode, productList]) => (
              <Box borderWidth="1px" margin="10px" padding="10px">
                <React.Fragment key={orderCode}>
                  <tr style={{ display: isMobile ? "block" : "table-row" }}>
                    <td
                      colSpan="8"
                      style={{
                        fontWeight: "bold",
                        cursor: "pointer",
                        whiteSpace: isMobile ? "nowrap" : "normal",
                        overflow: isMobile ? "hidden" : "visible",
                        textOverflow: isMobile ? "ellipsis" : "clip",
                      }}
                      onClick={() => handleOrderCodeClick(orderCode)}
                    >
                      Mã giao dịch:{" "}
                      {isMobile ? orderCode.substring(0, 10) : orderCode}{" "}
                      {selectedOrderCode === orderCode ? (
                        <Icon as={FaChevronUp} />
                      ) : (
                        <Icon as={FaChevronDown} />
                      )}
                    </td>
                    <Box mt="12px">
                      {productList[0].payment === "Banking" ? (
                        <Badge
                          colorScheme="green"
                          fontWeight="600"
                          fontSize={["10px", "15px", "18px"]}
                          ml="1"
                          color="black"
                        >
                          Phương thức: {productList[0].payment}
                        </Badge>
                      ) : (
                        <Badge
                          colorScheme="yellow"
                          fontWeight="600"
                          fontSize={["10px", "15px", "18px"]}
                          ml="1"
                          color="black"
                        >
                          Phương thức: {productList[0].payment}
                        </Badge>
                      )}
                      {productList[0].orderStatus === "Đã thanh toán" ? (
                        <Badge
                          colorScheme="green"
                          fontWeight="600"
                          fontSize="18px"
                          ml="1"
                          color="black"
                        >
                          Trạng thái: {productList[0].orderStatus}
                        </Badge>
                      ) : productList[0].orderStatus === "Đã hủy" ? (
                        <Badge
                          colorScheme="red"
                          fontWeight="600"
                          fontSize={["10px", "15px", "18px"]}
                          ml="1"
                          color="black"
                        >
                          Trạng thái: {productList[0].orderStatus}
                        </Badge>
                      ) : (
                        <Badge
                          colorScheme="yellow"
                          fontWeight="600"
                          fontSize={["10px", "15px", "18px"]}
                          ml="1"
                          color="black"
                        >
                          Trạng thái: {productList[0].orderStatus}
                        </Badge>
                      )}
                    </Box>
                  </tr>
                  <Text fontWeight="500" fontSize="15px" ml="1" color="#000c">
                    Ngày đặt hàng:{" "}
                    {new Date(productList[0].orderDate).toLocaleString()}
                  </Text>
                  {selectedOrderCode === orderCode &&
                    productList.map((product) => (
                      <Box padding="10px">
                        <hr />
                        <Box
                          mt="5"
                          display={["block", "block", "flex"]}
                          justifyContent="space-evenly"
                        >
                          <Center
                            key={product.id}
                            p={4}
                            borderRadius="md"
                            mb={4}
                          >
                            <Image
                              src={product.prodImg}
                              w={["80%", "100%", "100px"]}
                            />
                          </Center>
                          <Box width={["100%", "100%", "60%"]} padding="10px">
                            <Text
                              color="#424245"
                              noOfLines={2}
                              fontSize="20px"
                              fontWeight="500"
                            >
                              Tên sản phẩm: {product.prodName} {product.color}{" "}
                              {product.storage_value}
                            </Text>
                            <Text
                              fontWeight="500"
                              fontSize="15px"
                              ml="1"
                              color="#cccc"
                            >
                              Số lượng: x{product.quantity}
                            </Text>

                            <Text
                              fontWeight="500"
                              fontSize="15px"
                              ml="1"
                              color="red"
                            >
                              Giá: {product.prodPrice}VNĐ
                            </Text>
                          </Box>
                          <Box width="23%">
                            <Box display="flex" mt="30px">
                              <Link to={`/${product.prodID}`}>
                                <Button
                                  type="submit"
                                  colorScheme="blue"
                                  marginRight="10px"
                                  borderRadius={"2px"}
                                >
                                  Mua lại
                                </Button>
                              </Link>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                </React.Fragment>
                <Box display="flex">
                  <Text
                    fontWeight="600"
                    fontSize="18px"
                    ml="1"
                    color="red"
                    _hover={{ color: "red" }}
                  >
                    Thành Tiền: {formatCurrency(productList[0].totalPay)}
                  </Text>
                </Box>
                {productList[0].orderStatus !== "Đã hủy" ? (
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      handleCancelOrder(productList[0].infoID);
                    }}
                  >
                    Hủy đơn
                  </Button>
                ) : null}
              </Box>
            ))}
          <div>
            {[
              ...Array(
                Math.ceil(Object.entries(productsByOrderCode).length / 10),
              ),
            ].map((e, i) => (
              <Button
                mr={2}
                type="button"
                key={i}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Box m="4">
            <Text fontWeight="700" fontSize="20px" ml="1" color="green">
              Tổng chi tiêu: {formatCurrency(totalExpenditure)}
            </Text>
          </Box>
        </React.Fragment>
      </Box>
    );
  };

  const clearAddress = () => {
    //function get username call to this router using axios to delete user: router.delete('/address/:username'
    const apiUrl = `${process.env.REACT_APP_DATABASE_API_URL}/users/address/${username}`;
    axios
      .delete(apiUrl)
      .then((response) => {
        toast({
          position: "top",
          title: "Địa chỉ được xóa thành công.",
          description: "Hãy thêm địa chỉ giao hàng mới.",
          status: "success",
          duration: 500,
          isClosable: true,
        });
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error deleting address:", error);
      });
  };
  const handleAddressSubmit = () => {
    const newAddress = {
      username: username,
      firstname: address.current.setfirstname.value,
      lastname: address.current.setlastname.value,
      flat: address.current.setflat.value,
      state: address.current.setstate.value,
      street: address.current.setstreet.value,
      city: address.current.setcity.value,
      mobile: address.current.setmobile.value,
    };

    const apiUrl = `${process.env.REACT_APP_DATABASE_API_URL}/users/address`;

    if (
      !addressData ||
      !Array.isArray(addressData) ||
      addressData.length === 0
    ) {
      // If the address does not exist, perform a POST request
      axios
        .post(apiUrl, newAddress)
        .then((response) => {
          toast({
            position: "top",
            title: "Địa chỉ được thêm thành công.",
            description: "Chúng tôi sẽ sử dụng thông tin để liên hệ.",
            status: "success",
            duration: 500,
            isClosable: true,
          });
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error adding address:", error);
        });
    } else {
      // If the address exists, perform a PUT request
      axios
        .put(apiUrl, newAddress)
        .then((response) => {
          toast({
            position: "top",
            title: "Địa chỉ được cập nhật thành công.",
            description: "Chúng tôi sẽ sử dụng thông tin để liên hệ.",
            status: "success",
            duration: 500,
            isClosable: true,
          });
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error updating address:", error);
        });
    }
  };
  const [addressData, setAddressData] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_DATABASE_API_URL}/users/address/${username}`,
      )
      .then((response) => {
        setAddressData(response.data);
      })
      .catch((error) => {
        console.error("Error getting address:", error);
      });
  }, [username]);
  // const [provinces, setProvinces] = useState([]);
  // const [districts, setDistricts] = useState([]);
  // useEffect(() => {
  //   fetchData(2, setProvinces);
  // }, []);
  // const fetchData = (depth, setData, parentCode = null) => {
  //   axios
  //     .get(
  //       `https://provinces.open-api.vn/api/?depth=${depth}&parent_code=${parentCode}`,
  //     )
  //     .then((response) => {
  //       setData(response.data);
  //       console.log(response.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };
  // const [selectedProvince, setSelectedProvince] = useState("");
  // const [selectedDistrict, setSelectedDistrict] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const provincesData = [
      { code: "01", name: "Hà Nội" },
      { code: "02", name: "Hồ Chí Minh" },
      { code: "03", name: "Đà Nẵng" },
      { code: "04", name: "Hải Phòng" },
      { code: "05", name: "Cần Thơ" },
      // thêm các tỉnh/thành phố khác ở đây
    ];
    const districtsData = [
      { code: "001", name: "Quận Ba Đình", provinceCode: "01" },
      { code: "002", name: "Quận Hoàn Kiếm", provinceCode: "01" },
      { code: "003", name: "Quận Tây Hồ", provinceCode: "01" },
      { code: "004", name: "Quận Long Biên", provinceCode: "01" },
      { code: "005", name: "Quận Cầu Giấy", provinceCode: "01" },
      { code: "006", name: "Quận 1", provinceCode: "02" },
      { code: "007", name: "Quận 2", provinceCode: "02" },
      { code: "008", name: "Quận 3", provinceCode: "02" },
      { code: "009", name: "Quận 4", provinceCode: "02" },
      { code: "010", name: "Quận 5", provinceCode: "02" },
      // thêm các quận/huyện khác ở đây
    ];

    setProvinces(provincesData);
    setDistricts(districtsData);
  };

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value; // Giữ value là name
    setSelectedProvince(provinceName);

    if (provinceName) {
      const selectedProvinceData = provinces.find(
        (province) => province.name === provinceName,
      );
      setDistricts(
        districts.filter(
          (district) => district.provinceCode === selectedProvinceData.code,
        ),
      );
    } else {
      // Clear districts when no province is selected
      setDistricts([]);
    }
    setSelectedDistrict({}); // reset selected district when province changes
  };

  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    const selectedDistrictData = districts.find(
      (district) => district.name === districtName,
    );
    setSelectedDistrict(selectedDistrictData || {});
  };
  const renderAddressData = () => {
    if (
      !addressData ||
      !Array.isArray(addressData) ||
      addressData.length === 0
    ) {
      return (
        <Box
          textAlign="center"
          p="20px"
          borderWidth="1px"
          width="100%"
          borderRadius="md"
          w="300px"
        >
          <Center>
            <Image
              src="https://icon-library.com/images/free-avatar-icon/free-avatar-icon-10.jpg"
              alt=""
              borderRadius="full"
              boxSize="150px"
            />
          </Center>
          <Divider my="20px" />
          <VStack spacing="10px">
            <Text fontSize="2xl" fontWeight="bold">
              {username}
            </Text>
            <Text fontSize="md">Bạn chưa có địa chỉ giao hàng</Text>
            <Button onClick={onOpen} colorScheme="blue" variant="outline">
              Nhập địa chỉ giao hàng mới
            </Button>
          </VStack>
        </Box>
      );
    }

    return addressData.map((address, index) => (
      <>
        <UserInfo address={address} />
      </>
    ));
  };
  // const handleProvinceChange = (e) => {
  //   const provinceName = e.target.value; // Giữ value là name
  //   setSelectedProvince(provinceName);

  //   if (provinceName) {
  //     const selectedProvinceData = provinces.find(
  //       (province) => province.name === provinceName,
  //     );
  //     setDistricts(selectedProvinceData.districts || []);
  //   } else {
  //     // Clear districts when no province is selected
  //     setDistricts([]);
  //   }
  //   setSelectedDistrict(""); // reset selected district when province changes
  // };
  return (
    <Box
      display={["block", "block", "flex"]}
      maxW="30̀%"
      mt="20px"
      p="10px"
      borderWidth="1px"
      borderRadius="md"
      className="profile-container"
    >
      <Center>
        <div>
          <Accordion defaultIndex={[0]} allowMultiple>
            <AccordionItem>
              <AccordionPanel>
                <Modal isOpen={isOpen} onClose={onClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Địa chỉ giao hàng</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Flex flexDirection="column" gap="1rem">
                        <Input
                          placeholder="Họ*"
                          ref={(e) => (address.current["setfirstname"] = e)}
                        />
                        <Input
                          placeholder="Tên*"
                          ref={(e) => (address.current["setlastname"] = e)}
                        />
                        <Input
                          placeholder="Địa chỉ cụ thể (Tòa nhà)*"
                          ref={(e) => (address.current["setflat"] = e)}
                        />
                        <Input
                          placeholder="Đường*"
                          ref={(e) => (address.current["setstreet"] = e)}
                        />

<Select
                ref={(el) => (address.current.setstate = el)}
                value={selectedProvince}
                onChange={handleProvinceChange}
              >
                <option  value="">Chọn tỉnh/thành phố</option>
                {provinces.map((province) => (
                  <option key={province.province_id} value={province.province_id}>
                    {province.province_name}
                  </option>
                ))}
              </Select>
              <Select
                ref={(el) => (address.current.setcity = el)}
                value={selectedDistrict}
                onChange={handleDistrictChange}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map((district) => (
                  <option >
                    {district.district_name}
                  </option>
                ))}
              </Select>

                        <Input
                          type="number"
                          placeholder="Số điện thoại*"
                          ref={(e) => (address.current["setmobile"] = e)}
                        />
                        <Button
                          colorScheme="blue"
                          mr={3}
                          onClick={() => {
                            handleAddressSubmit();
                          }}
                        >
                          SUBMIT
                        </Button>
                        <Button
                          variant="ghost"
                          colorScheme="blue"
                          mr={3}
                          onClick={onClose}
                        >
                          Cancel
                        </Button>
                      </Flex>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </Center>
      <Box w={["100%", "100%", "30%"]}>{renderAddressData()}</Box>
      <Box w={["100%", "100%", "80%"]} padding={"5px"}>
        <Heading as="h2" size="lg" m={"0 7px 12px 12px"}>
          Đơn mua
        </Heading>
        <InputGroup
          margin={["0 7px 12px 12px", "0 7px 12px 12px", "10px"]}
          w={["94%", "100%", "98%"]}
          bg="#eaeaea"
        >
          {/* <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="gray.300" />}
          /> */}
        </InputGroup>
        {renderProducts()}
        <br />
      </Box>
    </Box>
  );
};

export default MyOrder;
