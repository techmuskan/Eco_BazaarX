package com.SignupForm.repository;

import com.SignupForm.entity.Address;
import com.SignupForm.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUser(Users user);
}