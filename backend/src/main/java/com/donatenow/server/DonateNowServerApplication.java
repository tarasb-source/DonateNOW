package com.donatenow.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DonateNowServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DonateNowServerApplication.class, args);
	}

}
