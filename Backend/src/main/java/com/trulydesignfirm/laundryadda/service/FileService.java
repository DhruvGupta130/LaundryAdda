package com.trulydesignfirm.laundryadda.service;

import com.trulydesignfirm.laundryadda.model.StoredFile;
import com.trulydesignfirm.laundryadda.model.Invoice;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;

@Service
public interface FileService {
    StoredFile saveFile(MultipartFile file) throws IOException;
    StoredFile getFile(UUID fileId) throws IOException;
    String deleteFile(UUID fileId) throws IOException;
    StoredFile uploadFile(Path path) throws IOException;
    Invoice getInvoice(UUID orderId);
}
