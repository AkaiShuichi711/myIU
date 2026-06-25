package com.myiu.portal.service;

import com.myiu.portal.entity.StoredFile;
import com.myiu.portal.repository.StoredFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    @Value("${app.storage.upload-dir:./uploads}")
    private String storageDir;

    @Value("${app.storage.base-url:http://localhost:8080}")
    private String baseUrl;

    private final StoredFileRepository storedFileRepository;

    public StoredFile store(MultipartFile file, UUID uploadedBy) throws IOException {
        Path dir = Paths.get(storageDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String storedName = UUID.randomUUID() + ext;
        Path dest = dir.resolve(storedName);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        StoredFile stored = StoredFile.builder()
                .originalName(original != null ? original : "file")
                .storedName(storedName)
                .contentType(file.getContentType())
                .sizeBytes(file.getSize())
                .uploadedBy(uploadedBy)
                .build();
        return storedFileRepository.save(stored);
    }

    public String getUrl(UUID fileId) {
        return storedFileRepository.findById(fileId)
                .map(f -> baseUrl + "/api/storage/files/" + f.getStoredName())
                .orElse(null);
    }

    public Path resolve(String storedName) {
        return Paths.get(storageDir).resolve(storedName);
    }

    public void delete(UUID fileId) throws IOException {
        storedFileRepository.findById(fileId).ifPresent(f -> {
            try {
                Files.deleteIfExists(Paths.get(storageDir).resolve(f.getStoredName()));
                storedFileRepository.delete(f);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }
}
