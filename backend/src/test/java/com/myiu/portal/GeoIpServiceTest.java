package com.myiu.portal;

import com.myiu.portal.repository.LoginSessionRepository;
import com.myiu.portal.service.GeoIpService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.myiu.portal.service.GeoIpService.GeoLocation;
import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class GeoIpServiceTest {

    @Mock LoginSessionRepository sessionRepo;
    @InjectMocks GeoIpService geoIpService;

    @Test
    void lookup_returns_local_for_loopback() {
        GeoLocation result = geoIpService.lookup("127.0.0.1");
        assertThat(result.country()).isEqualTo("Local Network");
    }

    @Test
    void lookup_returns_local_for_private_class_c() {
        GeoLocation result = geoIpService.lookup("192.168.1.100");
        assertThat(result.country()).isEqualTo("Local Network");
    }

    @Test
    void lookup_returns_local_for_ipv6_loopback() {
        GeoLocation result = geoIpService.lookup("::1");
        assertThat(result.country()).isEqualTo("Local Network");
    }

    @Test
    void lookup_returns_local_for_null_ip() {
        GeoLocation result = geoIpService.lookup(null);
        assertThat(result.country()).isEqualTo("Local Network");
    }
}
