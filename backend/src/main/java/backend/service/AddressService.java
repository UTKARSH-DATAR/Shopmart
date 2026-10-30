package backend.service;

import backend.entity.Address;
import backend.repository.AddressRepository;
import backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public Address addAddress(Address address) {
        return addressRepository.save(address);
    }

    public List<Address> getAddressesForUser(User user) {
        if (user != null && user.getId() != null) {
            return addressRepository.findByUserId(user.getId());
        }
        return addressRepository.findByUser(user);
    }

    public List<Address> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address getAddressById(Long id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + id));
    }

    public Address updateAddress(Long id, Address addressDetails) {
        Address address = getAddressById(id);
        address.setStreet(addressDetails.getStreet());
        address.setLine2(addressDetails.getLine2());
        address.setCity(addressDetails.getCity());
        address.setState(addressDetails.getState());
        address.setZipCode(addressDetails.getZipCode());
        return addressRepository.save(address);
    }

    public void deleteAddress(Long id) {
        Address address = getAddressById(id);
        addressRepository.delete(address);
    }

    public List<Address> getAllAddresses() {
        return addressRepository.findAll();
    }
}
