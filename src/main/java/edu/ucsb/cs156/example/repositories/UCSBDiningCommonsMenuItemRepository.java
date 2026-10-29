package edu.ucsb.cs156.example.repositories;

import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

/** Repository for UCSB dining commons menu items. */
@Repository
@RepositoryRestResource(exported = false)
public interface UCSBDiningCommonsMenuItemRepository
    extends CrudRepository<UCSBDiningCommonsMenuItem, Long> {}
