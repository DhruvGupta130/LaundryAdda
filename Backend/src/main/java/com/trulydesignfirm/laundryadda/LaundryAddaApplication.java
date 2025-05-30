package com.trulydesignfirm.laundryadda;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class LaundryAddaApplication {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(LaundryAddaApplication.class, args);
    }

}
